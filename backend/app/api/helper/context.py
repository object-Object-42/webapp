from sqlalchemy import create_engine, MetaData, Table, select


def fetch_content(
    db_url="postgresql+psycopg://postgres:changethis@db:5432/app", fetch_size=5
):
    """
    Fetch content from the database.

    Args:
        db_url (str): Database connection URL
        fetch_size (int): Number of records to fetch

    Returns:
        list: List of dictionaries containing Titel and Inhalt
    """
    try:
        # Create an engine instance
        engine = create_engine(db_url, echo=True)

        # Connect to the database
        with engine.connect() as connection:
            # Define metadata and reflect the existing database schema
            metadata = MetaData()
            metadata.reflect(bind=engine)

            # Define the content table
            content_table = Table("content", metadata, autoload_with=engine)

            # Create a select statement to query the table
            stmt = select(content_table)

            # Execute the query and fetch the results
            results = connection.execute(stmt).fetchmany(size=fetch_size)

            # Process the results
            context = []
            for row in results:
                context.append(
                    {
                        "Titel": row[0],
                        "Inhalt": row[1],
                    }
                )

            return context

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return []

    finally:
        # Ensure the connection is closed
        if "connection" in locals():
            connection.close()
