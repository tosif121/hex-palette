import type { NextPage } from "next"
import { Text, VStack } from "@yamada-ui/react"
import { NextLinkButton } from "components/navigation"

import { AppLayout } from "layouts/app-layout"

const Page: NextPage = () => {
  return (
    <AppLayout hasSidebar={false} title="404: Not found">
      <VStack alignItems="center" gap="xl" py="3xl">
        <VStack alignItems="center">
          <Text
            as="h1"
            fontFamily="heading"
            fontSize={{ base: "5xl", sm: "2xl", md: "3xl" }}
            fontWeight="bold"
            textAlign="center"
          >
            404 | Page Not Found
          </Text>

          <Text
            fontSize={{ base: "xl", sm: "lg" }}
            maxW="2xl"
            textAlign="center"
            w="full"
          >
            You just hit a route that doesn't exist... the sadness.😢
          </Text>
        </VStack>

        <NextLinkButton
          href="/"
          colorScheme="neutral"
          size="lg"
          bg={["blackAlpha.100", "whiteAlpha.100"]}
          borderColor="transparent"
          prefetch
        >
          Back to App
        </NextLinkButton>
      </VStack>
    </AppLayout>
  )
}

export default Page
