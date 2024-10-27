import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  type ApiError,
  type OrganisationCreate,
  OrganisationsService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface AddOrganisationProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddOrganisation = ({ isOpen, onClose }: AddOrganisationProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganisationCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      org_name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: OrganisationCreate) =>
      OrganisationsService.createOrganisation({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Item created successfully.", "success");
      reset();
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const onSubmit: SubmitHandler<OrganisationCreate> = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Organisation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.org_name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                {...register("org_name", {
                  required: "Name is required.",
                })}
                placeholder="Name"
                type="text"
              />
              {errors.org_name && (
                <FormErrorMessage>{errors.org_name.message}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddOrganisation;
