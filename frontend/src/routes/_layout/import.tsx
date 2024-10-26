import {
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/import")({
  component: Import,
});

function ImportFromUrl() {
  return (
    <>
      <FormControl>
        <HStack>
          <div>
            <FormLabel htmlFor="url">Base URL</FormLabel>
            <Input
              id="url"
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
            <FormLabel htmlFor="url_extension">URL Path</FormLabel>
            <Input id="url_path" placeholder="example" type="url" w="auto" />
          </div>
        </HStack>
      </FormControl>
      <Button variant="primary" mt={4} type="submit">
        Import
      </Button>
    </>
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
