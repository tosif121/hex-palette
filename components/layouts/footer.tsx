import type { CenterProps } from "@yamada-ui/react"
import { Center, forwardRef, Text, VStack } from "@yamada-ui/react"
import { memo } from "react"

export interface FooterProps extends CenterProps {}

export const Footer = memo(
  forwardRef<FooterProps, "div">(({ ...rest }, ref) => {
    return (
      <Center
        ref={ref}
        as="footer"
        position="sticky"
        top="100vh"
        w="full"
        {...rest}
      >
        <VStack
          alignItems="center"
          maxW="9xl"
          px={{ base: "lg", md: "md" }}
          py="xl"
          w="full"
        >
          <Text
            color={["blackAlpha.600", "whiteAlpha.600"]}
            fontSize={{ base: "md", sm: "sm" }}
            textAlign="center"
          >
            &copy; {new Date().getFullYear()} <Text as="span" fontWeight="semibold" color="primary">Hex Palette</Text>. All rights reserved.
          </Text>
        </VStack>
      </Center>
    )
  }),
)