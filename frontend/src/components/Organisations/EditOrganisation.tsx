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
  type OrganisationPublic,
  type OrganisationUpdate,
  OrganisationsService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface EditOrganisationProps {
  organisation: OrganisationPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditOrganisation = ({
  organisation,
  isOpen,
  onClose,
}: EditOrganisationProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<OrganisationUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: organisation,
  });

  const mutation = useMutation({
    mutationFn: (data: OrganisationUpdate) =>
      OrganisationsService.updateOrganisation({
        org_id: organisation.org_id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "Item updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const onSubmit: SubmitHandler<OrganisationUpdate> = async (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    reset();
    onClose();
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
          <ModalHeader>Edit Organisation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.org_name}>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Input
                id="name"
                {...register("org_name", {
                  required: "Name is required",
                })}
                type="text"
              />
              {errors.org_name && (
                <FormErrorMessage>{errors.org_name.message}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            >
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditOrganisation;
