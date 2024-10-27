
import { Box, Card, CardBody, Heading, Text } from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router";

type DashboardCardProps = {
    title: string;
    subtitle: string;
    image: JSX.Element;
    link: string;
  };
const DashboardCard = ({title, subtitle, image, link}: DashboardCardProps) => {

    const navigate = useNavigate()

    return (
        <Card m="50" onClick={() => {
            navigate({
                to: link
            })
        }}>
            <CardBody>
                <Box height="200px">
                    {image}
                </Box>
                <Heading m="25" ml="0">{title}</Heading>
                <Text>{subtitle}</Text>
            </CardBody>
        </Card>
    )
}

export default DashboardCard
