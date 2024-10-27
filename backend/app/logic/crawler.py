from app.api.deps import SessionDep

from app import models
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import datetime
import hashlib
import logging

import traceback


class Crawler:
    def __init__(
        self, base_url, organisation_id, session: SessionDep, base_url_path=None
    ):
        self.base_url = base_url
        if base_url_path == "":
            self.base_url_path = None
        else:
            self.base_url_path = base_url_path

        self.organisation_id = organisation_id
        self.session = session

    def crawl_data_and_store(self):

        if self.base_url_path == None:
            urls = [f"{self.base_url}/"]
        else:
            urls = [f"{self.base_url}/{self.base_url_path}"]
        crawled_urls = []
        page_hashes = []
        while len(urls) != 0:
            # get the page to crawl from the list
            urls = list(set(urls))
            current_url = urls.pop()
            # Check if page has already been crawled
            if current_url not in crawled_urls:
                try:
                    crawled_urls.append(current_url)

                    # Get content of page
                    response = requests.get(current_url)
                    response_text = response.content.decode(
                        "utf-8", errors="ignore"
                    )
                    md_content = md(response_text)
                    md_content.encode("utf-8").decode("utf-8", errors="ignore")
                    # Filter out empty lines
                    filtered_content = "\n".join(
                        line
                        for line in md_content.splitlines()
                        if line.strip()  # keep only non-empty lines
                    )
                    filtered_content = filtered_content.replace("\x00", "")
                    text_hash = hashlib.sha256(
                        filtered_content.encode()
                    ).hexdigest()
                    if text_hash not in page_hashes:

                        page_hashes.append(text_hash)
                        soup = BeautifulSoup(response.content, "html.parser")
                        page_title = (
                            soup.title.string
                            if soup.title
                            else "No title found"
                        )
                        page_title = page_title.encode("utf-8").decode(
                            "utf-8", errors="ignore"
                        )
                        soup.text
                        content = models.Content(
                            content_text=f"{filtered_content}",
                            created_at=datetime.datetime.now(),
                            url=f"{current_url}",
                            doc_name=page_title,
                            org_id=self.organisation_id,
                        )
                        self.session.add(content)
                        self.session.commit()

                        link_elements = soup.select("a[href]")
                        for link_element in link_elements:
                            url = link_element["href"]
                            url = url.split("?")[0]
                            if self.base_url_path is not None:
                                if (
                                    f"{self.base_url}/{self.base_url_path}"
                                    in url
                                    and url not in crawled_urls
                                    and url not in urls
                                ):
                                    urls.append(f"{url}")

                                elif (
                                    self.base_url_path in url
                                    and f"{self.base_url}/{url}"
                                    not in crawled_urls
                                    and f"{self.base_url}/{url}" not in urls
                                ):
                                    if url.startswith("http"):
                                        urls.append(url)
                                    else:
                                        urls.append(f"{self.base_url}{url}")

                            else:
                                if (
                                    self.base_url in url
                                    and url not in crawled_urls
                                    and url not in urls
                                ):
                                    urls.append(f"{url}")
                except:
                    logging.error(traceback.format_exc())
        return
