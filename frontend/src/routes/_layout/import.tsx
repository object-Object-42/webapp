import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { handleError } from "../../utils";

import { ApiError, ImportService, TImportDataWebsite } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { SubmitHandler, useForm } from "react-hook-form";

export const Route = createFileRoute("/_layout/import")({
  component: Import,
});

function ImportFromUrl() {
  const showToast = useCustomToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm<TImportDataWebsite>({
    mode: "onBlur",
    criteriaMode: "all",
  });
  const mutation = useMutation({
    mutationFn: (data: TImportDataWebsite) => ImportService.importWebsite(data),
    onSuccess: () => {
      showToast("Success!", "Item created successfully.", "success");
      reset();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
  const onSubmit: SubmitHandler<TImportDataWebsite> = async (data) => {
    mutation.mutate(data);
  };
  return (
    <>
      <Box
        w={{ sm: "full", md: "50%" }}
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormControl>
          <HStack>
            <div>
              <FormLabel htmlFor="url">Base URL</FormLabel>
              <Input
                id="url"
                {...register("url")}
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
                id="url_path"
                placeholder="example"
                {...register("url_path")}
                type="text"
                w="auto"
              />
            </div>
            <div>
              <FormLabel htmlFor="organisation_id">Organisation ID</FormLabel>
              <Input
                id="organisation_id"
                {...register("organisation_id")}
                placeholder="1"
                type="number"
                w="auto"
              />
            </div>
          </HStack>
        </FormControl>
        <Button variant="primary" mt={4} type="submit">
          Import
        </Button>
      </Box>
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
