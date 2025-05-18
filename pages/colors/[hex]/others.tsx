import type { FC, ReactNode } from "react"
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Motion,
  Text,
  VStack,
  Wrap,
} from "@yamada-ui/react"
import { Link, NextLink } from "components/navigation"
import { ColorCommandMenu } from "components/overlay"
import { useApp } from "contexts/app-context"

import { f } from "utils/color"

export interface OthersProps {
  alternativeColors: string[]
  complementaryColors: string[]
  hex: string
  hueColors: string[]
  splitComplementaryColors: string[]
  squareColors: string[]
  triadicColors: string[]
}

export const Others: FC<OthersProps> = ({
  alternativeColors,
  complementaryColors,
  hex,
  hueColors,
  splitComplementaryColors,
  squareColors,
  triadicColors,
}) => {
  
  const { format } = useApp()

  return (
    <Grid
      gap={{ base: "md", sm: "normal" }}
      templateColumns={{ base: "repeat(3, 1fr)", sm: "1fr" }}
    >
      <List
        colors={complementaryColors}
        description="180° apart from the hue"
        title="Complementary"
      />
      <List
        href={`/generators?hex=${hex.replace("#", "")}&tab=alternatives`}
        colors={alternativeColors}
        description={`Alternatives to ${f(hex, format)}`}
        more="See on Generator"
        title="Alternatives"
      />
      <List
        href={`/generators?hex=${hex.replace("#", "")}&tab=hues`}
        colors={hueColors}
        description="36° apart from each"
        more="See on Generator"
        title="Hues"
      />
      <List
        colors={triadicColors}
        description="120° apart from each"
        title="Triadic"
      />
      <List
        colors={squareColors}
        description="90° apart from each"
        title="Square"
      />
      <List
        colors={splitComplementaryColors}
        description="150° apart from each"
        title="Split Complementary"
      />
    </Grid>
  )
}

interface ListProps {
  colors: string[]
  description: ReactNode
  title: ReactNode
  href?: string
  more?: ReactNode
}

const List: FC<ListProps> = ({ href, colors, description, more, title }) => {
  return (
    <GridItem as="section" display="flex" flexDirection="column" gap="md">
      <VStack gap={{ base: "xs", sm: "0" }}>
        <Heading fontSize={{ base: "lg" }}>{title}</Heading>

        <Text color="muted" fontSize="sm" lineClamp={1}>
          {description}
        </Text>
      </VStack>

      <Box as="nav">
        <Wrap as="ul" gap={{ base: "sm" }}>
          {colors.map((hex, index) => (
            <ColorCommandMenu key={`${hex}-${index}`} value={hex}>
              <Motion as="li" whileHover={{ scale: 0.95 }}>
                <Box
                  as={NextLink}
                  href={`/colors/${hex.replace("#", "")}`}
                  bg={hex}
                  boxSize={{ base: "8" }}
                  display="block"
                  outlineColor="focus"
                  rounded="lg"
                />
              </Motion>
            </ColorCommandMenu>
          ))}
        </Wrap>
      </Box>

      {more && href ? (
        <Link
          href={href}
          variant="muted"
          alignSelf="flex-start"
          fontSize="sm"
          prefetch
          whiteSpace="nowrap"
        >
          {more}
        </Link>
      ) : null}
    </GridItem>
  )
}
