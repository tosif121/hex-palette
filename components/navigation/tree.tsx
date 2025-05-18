import type { BoxProps, StackProps } from "@yamada-ui/react"
import type { ReactNode } from "react"
import {
  Compass,
  Contrast,
  History,
  Paintbrush,
  Palette,
} from "@yamada-ui/lucide"
import {
  Box,
  forwardRef,
  HStack,
  isString,
  Text,
  VStack,
} from "@yamada-ui/react"
import { useApp } from "contexts/app-context"

import { useRouter } from "next/router"
import { memo } from "react"
import { NextLink } from "./next-link"

export interface TreeProps extends BoxProps {
  isAside?: boolean
}

export const Tree = memo(
  forwardRef<TreeProps, "nav">(({ isAside, ...rest }, ref) => {
    const { hex } = useApp()
    

    const hexes = {
      light: isString(hex) ? hex : hex?.[0],
      dark: isString(hex) ? hex : hex?.[1],
    }

    return (
      <Box ref={ref} as="nav" w="full" {...rest}>
        <VStack as="ul" gap="sm" w="full">
          <TreeItem
            href="/"
            icon={<Compass fontSize="1.5rem" />}
            isAside={isAside}
          >
            Explore
          </TreeItem>
          <TreeItem
            href="/palettes"
            icon={<Palette fontSize="1.5rem" />}
            isAside={isAside}
          >
            My Palettes
          </TreeItem>
          <TreeItem
            href={`/generators?hex=${hexes.light?.replace("#", "")}`}
            icon={<Paintbrush fontSize="1.5rem" />}
            isAside={isAside}
          >
            Generators
          </TreeItem>
          <TreeItem
            href={`/contrast-checker?light.fg=${hexes.light?.replace("#", "")}&dark.fg=${hexes.dark?.replace("#", "")}`}
            icon={<Contrast fontSize="1.5rem" />}
            isAside={isAside}
          >
            Contrast Checker
          </TreeItem>
          <TreeItem
            href="/history"
            icon={<History fontSize="1.5rem" />}
            isAside={isAside}
          >
            History
          </TreeItem>
        </VStack>
      </Box>
    )
  }),
)

export interface TreeItemProps extends StackProps {
  href: string
  icon?: ReactNode
  isAside?: boolean
}

export const TreeItem = memo(
  forwardRef<TreeItemProps, "a">(
    ({ href, children, icon = null, isAside, ...rest }, ref) => {
      const router = useRouter()
      const { asPath } = router
      const trulyHref = href.split("?")[0] ?? ""
      const isSelected =
        trulyHref === "/" ? asPath === trulyHref : asPath.startsWith(trulyHref)

      return (
        <Box as="li" w="full">
          <HStack
            ref={ref}
            as={NextLink}
            href={href}
            bg={
              isSelected
                ? isAside
                  ? ["white", "black"]
                  : ["blackAlpha.200", "blackAlpha.700"]
                : undefined
            }
            color={!isSelected ? "muted" : undefined}
            gap="sm"
            h="12"
            outline="none"
            prefetch
            px="md"
            rounded="md"
            transitionDuration="slower"
            transitionProperty="common"
            w="full"
            _focusVisible={{
              boxShadow: "outline",
            }}
            _hover={{
              color: !isSelected ? ["black", "white"] : undefined,
            }}
            {...rest}
          >
            {icon}

            <Text as="span">{children}</Text>
          </HStack>
        </Box>
      )
    },
  ),
)
