import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  FiArchive,
  FiBriefcase,
  FiDownload,
  FiHome,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

import type { UserPublic } from "../../client";
import { ChatIcon } from "@chakra-ui/icons";

const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: ChatIcon, title: "Chat", path: "/chat" },
  { icon: FiBriefcase, title: "Clustering", path: "/clustering" },
  { icon: FiArchive, title: "Podcasts", path: "/podcasts" },
  { icon: FiSettings, title: "User Settings", path: "/settings" },
  { icon: FiDownload, title: "Import Data", path: "/import" },
  { icon: FiArchive, title: "Organisations", path: "/organisation" },
];

interface SidebarItemsProps {
  onClose?: () => void;
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient();
  const textColor = useColorModeValue("ui.main", "ui.light");
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568");
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);

  const finalItems = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: "User management", path: "/admin" }]
    : items;

  const listItems = finalItems.map(({ icon, title, path }) => (
    <Flex
      as={Link}
      to={path}
      w="100%"
      p={2}
      key={title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" />
      <Text ml={2}>{title}</Text>
    </Flex>
  ));

  return (
    <>
      <Box>{listItems}</Box>
    </>
  );
};

export default SidebarItems;
