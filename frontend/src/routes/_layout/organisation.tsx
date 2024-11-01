import {
  Container,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { OrganisationsService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import AddOrganisation from "../../components/Organisations/AddOrganisation.tsx";
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx";

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/organisation")({
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
});

const PER_PAGE = 5;

function getOrganisationQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      OrganisationsService.readOrganisations({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["items", { page }],
  };
}

function OrganisationTable() {
  const queryClient = useQueryClient();
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const {
    data: items,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getOrganisationQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const hasNextPage = !isPlaceholderData && items?.data.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getOrganisationQueryOptions({ page: page + 1 })
      );
    }
  }, [page, queryClient, hasNextPage]);

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map(() => (
                  <Td key={uuidv4()}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {items?.data.map((item) => (
                <Tr key={item.org_id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{item.org_id}</Td>
                  <Td isTruncated maxWidth="150px">
                    {item.org_name}
                  </Td>

                  <Td>
                    <ActionsMenu type={"Item"} value={item} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <PaginationFooter
        page={page}
        onChangePage={setPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </>
  );
}

function Items() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Organisations Management
      </Heading>

      <Navbar type={"Organisation"} addModalAs={AddOrganisation} />
      <OrganisationTable />
    </Container>
  );
}
