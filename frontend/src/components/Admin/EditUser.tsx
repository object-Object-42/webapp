import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import {
  useMutation,
  useQueryClient,
  useQuery,
  InvalidateQueryFilters,
} from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

interface UserOrgStatus {
  org_id: string;
  org_name: string;
  active: boolean;
}

interface UserOrgStatusList {
  data: Array<UserOrgStatus>;
}

import {
  type ApiError,
  OrganisationPublic,
  OrganisationsService,
  type UserPublic,
  type UserUpdate,
  UsersService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { emailPattern, handleError } from "../../utils";
import { useEffect, useState } from "react";

interface EditUserProps {
  user: UserPublic;
  isOpen: boolean;
  onClose: () => void;
}

interface UserUpdateForm extends UserUpdate {
  confirm_password: string;
}
function getOrganisationQueryOptions() {
  return {
    queryFn: () => OrganisationsService.readOrganisations(),
    queryKey: ["items"],
  };
}
const EditUser = ({ user, isOpen, onClose }: EditUserProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    data: organisations,
    isSuccess: successOrganisations,
    // isPending,
    // isPlaceholderData,
  } = useQuery({
    ...getOrganisationQueryOptions(),
    placeholderData: (prevData) => prevData,
  });

  function getUserOrganisationsQueryOptions(data: string) {
    return {
      queryFn: () => UsersService.readUserOrganisationById({ userId: data }),
      queryKey: ["userOrg", data],
    };
  }

  const {
    data: userOrganisations,
    refetch,
    isSuccess: successUserOrgs,

    // isPending,
    // isPlaceholderData,
  } = useQuery({
    ...getUserOrganisationsQueryOptions(user.id),
    placeholderData: (prevData) => prevData,
  });
  useEffect(() => {
    refetch();
  }, [user]);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: user,
  });
  const [userRoleStatus, setUserRoleStatus] = useState<UserOrgStatusList>();
  const [currentlyChecked, setCurrentlyChecked] = useState<
    Array<string> | string
  >();
  useEffect(() => {
    if (user.id) {
      queryClient.invalidateQueries([
        "userOrg",
        user.id,
      ] as InvalidateQueryFilters); // Clear the old cache
      refetch(); // Fetch with updated user.id
    }
  }, [user, queryClient, refetch]);
  useEffect(() => {
    if (successUserOrgs && successOrganisations) {
      let isChecked: Array<string> = [];

      setUserRoleStatus({
        data: organisations.data.map((item: OrganisationPublic) => {
          const active = userOrganisations.data.some(
            (el) => el.org_id == item.org_id
          );
          if (active) {
            isChecked = [...isChecked, item.org_id];
          }
          return {
            org_id: item.org_id,
            org_name: item.org_name,
            active: active,
          };
        }),
      }),
        setCurrentlyChecked(isChecked);
    }
  }, [successUserOrgs, successOrganisations]);
  const mutation = useMutation({
    mutationFn: (data: UserUpdateForm) =>
      UsersService.updateUser({ userId: user.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "User updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onSubmit: SubmitHandler<UserUpdateForm> = async (data) => {
    if (data.password === "") {
      data.password = undefined;
    }
    mutation.mutate({
      ...data,
      active_org_ids: currentlyChecked as Array<string>,
    });
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
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: emailPattern,
                })}
                placeholder="Email"
                type="email"
              />
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <Input id="name" {...register("full_name")} type="text" />
            </FormControl>
            <FormControl mt={4} isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Set Password</FormLabel>
              <Input
                id="password"
                {...register("password", {
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Password"
                type="password"
              />
              {errors.password && (
                <FormErrorMessage>{errors.password.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isInvalid={!!errors.confirm_password}>
              <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
              <Input
                id="confirm_password"
                {...register("confirm_password", {
                  validate: (value) =>
                    value === getValues().password ||
                    "The passwords do not match",
                })}
                placeholder="Password"
                type="password"
              />
              {errors.confirm_password && (
                <FormErrorMessage>
                  {errors.confirm_password.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <Flex>
              <FormControl mt={4}>
                <Checkbox {...register("is_superuser")} colorScheme="teal">
                  Is superuser?
                </Checkbox>
              </FormControl>
              <FormControl mt={4}>
                <Checkbox {...register("is_active")} colorScheme="teal">
                  Is active?
                </Checkbox>
              </FormControl>
            </Flex>
            <FormControl mt={4}>
              <Menu closeOnSelect={false}>
                <MenuButton as={Button}>Organisations</MenuButton>
                <MenuList minWidth="240px">
                  <MenuOptionGroup
                    defaultValue={currentlyChecked}
                    title="Organisation"
                    type="checkbox"
                    onChange={(e) => {
                      setCurrentlyChecked(e);
                    }}
                  >
                    {userRoleStatus?.data.map((item) => {
                      return (
                        <MenuItemOption value={item.org_id}>
                          {item.org_name}
                        </MenuItemOption>
                      );
                    })}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
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

export default EditUser;
