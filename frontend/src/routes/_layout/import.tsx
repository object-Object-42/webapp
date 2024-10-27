import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { handleError } from "../../utils";

import {
  ApiError,
  ImportService,
  OrganisationPublic,
  OrganisationsService,
  TImportDataWebsite,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useState } from "react";

export const Route = createFileRoute("/_layout/import")({
  component: Import,
});
function getOrganisationQueryOptions() {
  return {
    queryFn: () => OrganisationsService.readOrganisations(),
    queryKey: ["items"],
  };
}

function ImportFromUrl() {
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const {
    data: organisations,
    // isPending,
    // isPlaceholderData,
  } = useQuery({
    ...getOrganisationQueryOptions(),
    placeholderData: (prevData) => prevData,
  });

  const mutation = useMutation({
    mutationFn: (data: TImportDataWebsite) => ImportService.importWebsite(data),
    onSuccess: () => {
      showToast("Success!", "Item created successfully.", "success");
      setUrl("");
      setSelectedDropdownElement(undefined);
      setUrlPath("");
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
  const [selectedDropdownElement, setSelectedDropdownElement] = useState<
    OrganisationPublic | undefined
  >();
  const [url, setUrl] = useState<string>("");
  const [urlInvalid, setUrlInvalid] = useState<boolean>(true);
  const [urlPath, setUrlPath] = useState<string>("");
  const onSubmit = async () => {
    if (urlInvalid) {
      showToast("Error", "URL invalid", "error");
    } else if (selectedDropdownElement) {
      mutation.mutate({
        url: url,
        url_path: urlPath,
        organisation_id: selectedDropdownElement?.org_id,
      });
    } else {
      showToast("Error", "No Organisation selected", "error");
    }
  };

  return (
    <Box w={{ sm: "full", md: "50%" }} as="form">
      <FormControl>
        <HStack>
          <div>
            <FormLabel htmlFor="url">Base URL</FormLabel>
            <Input
              value={url}
              isInvalid={urlInvalid}
              onChange={(data) => {
                setUrl(data.target.value);
                setUrlInvalid(!data.target.checkValidity());
              }}
              id="url"
              // {...register("url")}
              placeholder="https://example.com"
              type="url"
              w="auto"
            />
          </div>
          <div>
            <FormLabel htmlFor="slash"> &nbsp;</FormLabel>
            <Input
              isDisabled
              color="black" // Set the text color explicitly
              _disabled={{ bg: "gray.100", opacity: 1 }}
              id="slash"
              value={"/"}
              placeholder="/"
              type="text"
              w="10"
            />
          </div>
          <div>
            <FormLabel htmlFor="url_path">URL Path</FormLabel>

            <Input
              value={urlPath}
              id="url_path"
              placeholder="example"
              onChange={(data) => {
                setUrlPath(data.target.value);
              }}
              type="text"
              w="auto"
            />
          </div>
          <div>
            <FormLabel htmlFor="organisation">Organisation</FormLabel>
            {organisations && (
              <Menu id="organisation">
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                  {selectedDropdownElement
                    ? selectedDropdownElement.org_name
                    : "Select Organisation"}
                </MenuButton>
                <MenuList>
                  {organisations!.data.map((item) => {
                    return (
                      <MenuItem
                        key={item.org_id}
                        onClick={() => {
                          setSelectedDropdownElement(item);
                        }}
                      >
                        {item.org_name}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Menu>
            )}
          </div>
        </HStack>
      </FormControl>
      <Button variant="primary" mt={4} onClick={onSubmit}>
        Import
      </Button>
    </Box>
  );
}

function Import() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Import Data
      </Heading>
      <ImportFromUrl />
    </Container>
  );
}
