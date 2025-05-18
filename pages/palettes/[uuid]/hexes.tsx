import type { BoxProps, ColorMode } from "@yamada-ui/react"
import type { FC } from "react"
import { GripVertical, Moon, Plus, RefreshCcw, Sun } from "@yamada-ui/lucide"
import {
  Box,
  Button,
  Center,
  ChevronIcon,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Reorder,
  ReorderItem,
  ReorderTrigger,
  Text,
  Tooltip,
  useUpdateEffect,
  VStack,
} from "@yamada-ui/react"
import { NextLink } from "components/navigation"
import { ColorCommandMenu } from "components/overlay"
import { CONSTANT } from "constant"
import { useApp } from "contexts/app-context"

import { memo, useCallback, useMemo, useRef, useState } from "react"
import { blindness, darken, f, isLight, lighten, tone } from "utils/color"
import { generateUUID, setCookie } from "utils/storage"
import { HexesProvider, HexProvider, useHexes, usePalette } from "./context"
import { HexControlButtons } from "./hex-control-buttons"

const DEFAULT_COLOR: PaletteColor = {
  name: "White",
  hex: ["#ffffff", "#ffffff"],
}

export interface HexesProps {}

export const Hexes: FC<HexesProps> = memo(() => {
  const {
    name,
    changeColors,
    colorMode: colorModeProp,
    colors,
    timestamp,
    uuid,
  } = usePalette()
  
  const { changePalette } = useApp()
  const [colorMode, setColorMode] = useState<ColorMode>(colorModeProp)
  const isLight = colorMode === "light"

  const toggleColorMode = useCallback(() => {
    const resolvedColorMode: ColorMode = isLight ? "dark" : "light"

    setCookie(CONSTANT.STORAGE.PALETTE_COLOR_MODE, resolvedColorMode)
    setColorMode(resolvedColorMode)
  }, [isLight])

  const onCreate = () => {
    const computedColors = colors.map(({ name, hex }) => ({ name, hex }))

    changeColors((prev) => [...prev, { id: generateUUID(), ...DEFAULT_COLOR }])

    changePalette({
      name,
      colors: [...computedColors, { ...DEFAULT_COLOR }],
      timestamp,
      uuid,
    })
  }

  const onEdit = useCallback(
    ({ id, ...rest }: ReorderColor) => {
      const computedColors = colors.map(({ id: targetId, name, hex }) =>
        targetId === id ? rest : { name, hex },
      )

      changeColors((prev) =>
        prev.map((color) => (color.id === id ? { id, ...rest } : color)),
      )

      changePalette({ name, colors: computedColors, timestamp, uuid })
    },
    [changePalette, colors, name, changeColors, uuid, timestamp],
  )

  const onClone = useCallback(
    ({ id, ...rest }: ReorderColor) => {
      const index = colors.findIndex((color) => color.id === id)

      const computedColors = colors.map(({ name, hex }) => ({ name, hex }))

      changeColors((prev) => [
        ...prev.slice(0, index),
        { id: generateUUID(), ...rest },
        ...prev.slice(index),
      ])

      const resolvedColors = [
        ...computedColors.slice(0, index),
        { ...rest },
        ...computedColors.slice(index),
      ]

      changePalette({ name, colors: resolvedColors, timestamp, uuid })
    },
    [changePalette, colors, name, changeColors, uuid, timestamp],
  )

  const onDelete = useCallback(
    (targetId: string) => {
      const resolvedColors = colors
        .map(({ id, name, hex }) =>
          targetId !== id ? { name, hex } : undefined,
        )
        .filter(Boolean) as PaletteColors

      changeColors((prev) => prev.filter(({ id }) => id !== targetId))

      changePalette({ name, colors: resolvedColors, timestamp, uuid })
    },
    [changePalette, colors, name, changeColors, uuid, timestamp],
  )

  const value = useMemo(
    () => ({ colorMode, toggleColorMode, onClone, onDelete, onEdit }),
    [colorMode, onClone, onEdit, onDelete, toggleColorMode],
  )

  return (
    <HexesProvider value={value}>
      <VStack as="section">
        <HexHeader />

        <HexReorder />
      </VStack>

      <Center as="section" w="full">
        <Button
          colorScheme="neutral"
          bg={["blackAlpha.100", "whiteAlpha.100"]}
          borderColor="transparent"
          leftIcon={<Plus fontSize="1.125rem" />}
          onClick={onCreate}
        >
          Create a palette
        </Button>
      </Center>
    </HexesProvider>
  )
})

Hexes.displayName = "Hexes"

interface HexHeaderProps {}

const HexHeader: FC<HexHeaderProps> = memo(() => {
  
  const { colorMode, toggleColorMode } = useHexes()

  return (
    <>
      <Grid
        display={{
          base: "grid",
          md: "none",
          lg: "grid",
          xl: "none",
        }}
        gap="lg"
        gridTemplateColumns="1fr 1fr"
      >
        <GridItem as={HStack} gap="sm" justifyContent="center">
          <Box color="muted" display="inline-flex">
            <Sun fontSize="1.5rem" />
          </Box>

          <Text fontSize="2xl" fontWeight="medium" textAlign="center">
            Light
          </Text>
        </GridItem>

        <GridItem as={HStack} gap="sm" justifyContent="center">
          <Box color="muted" display="inline-flex">
            <Moon fontSize="1.5rem" />
          </Box>

          <Text fontSize="2xl" fontWeight="medium" textAlign="center">
            Dark
          </Text>
        </GridItem>
      </Grid>

      <Center
        display={{
          base: "none",
          md: "flex",
          lg: "none",
          xl: "flex",
        }}
        position="relative"
      >
        <HStack gap="sm" justifyContent="center">
          <Box color="muted" display="inline-flex">
            {colorMode === "light" ? (
              <Sun fontSize="1.5rem" />
            ) : (
              <Moon fontSize="1.5rem" />
            )}
          </Box>

          <Text fontSize="2xl" fontWeight="medium" textAlign="center">
            {colorMode === "light" ? "Light" : "Dark"}
          </Text>
        </HStack>

        <IconButton
          colorScheme="neutral"
          variant="ghost"
          aria-label="Switching color mode"
          color="muted"
          icon={<RefreshCcw size="1.125rem" />}
          isRounded
          position="absolute"
          right="0"
          top="50%"
          transform="translateY(-50%)"
          _hover={{
            bg: ["blackAlpha.100", "whiteAlpha.100"],
          }}
          onClick={toggleColorMode}
        />
      </Center>
    </>
  )
})

HexHeader.displayName = "HexHeader"

interface HexReorderProps {}

const HexReorder: FC<HexReorderProps> = memo(() => {
  const { name, changeColors, colors, timestamp, uuid } = usePalette()
  
  const { colorMode, onEdit } = useHexes()
  const { changePalette } = useApp()

  const onCompleteChange = (ids: string[]) => {
    const resolvedColors = ids.map((id) => {
      const { name, hex } = colors.find((item) => item.id === id)!

      return { name, hex }
    })

    changeColors((prev) =>
      ids.map((id) => prev.find((item) => item.id === id)!),
    )
    changePalette({ name, colors: resolvedColors, timestamp, uuid })
  }

  return (
    <Reorder variant="unstyled" gap="0" onCompleteChange={onCompleteChange}>
      {colors.map((value, index) => {
        const { id, name, hex } = value
        const [lightHex, darkHex] = hex

        return (
          <ReorderItem
            key={id}
            data-group
            data-index={index}
            display="grid"
            gap="sm"
            gridTemplateColumns={{
              base: "1fr auto 1fr",
              md: "1fr",
              lg: "1fr auto 1fr",
              xl: "1fr",
            }}
            value={id}
          >
            <HexProvider value={value}>
              <HexToggleItem
                display={{
                  base: "block",
                  md: colorMode !== "light" ? "none" : "block",
                  lg: "block",
                  xl: colorMode !== "light" ? "none" : "block",
                }}
                {...{ id, name, colorMode: "light", hex }}
              />

              <VStack
                display={{ base: "flex", md: "none", lg: "flex", xl: "none" }}
                gap="0"
              >
                <Tooltip label={"Apply to Light"} placement="top">
                  <IconButton
                    colorScheme="neutral"
                    variant="ghost"
                    aria-label="Sync with dark"
                    color={["blackAlpha.500", "whiteAlpha.500"]}
                    icon={
                      <ChevronIcon
                        fontSize="1.5rem"
                        transform="rotate(-90deg)"
                      />
                    }
                    isRounded
                    right="0"
                    _hover={{
                      bg: ["blackAlpha.100", "whiteAlpha.100"],
                    }}
                    onClick={() =>
                      onEdit({ id, name, hex: [lightHex, lightHex] })
                    }
                  />
                </Tooltip>

                <Tooltip label={"Apply to Dark"} placement="top">
                  <IconButton
                    colorScheme="neutral"
                    variant="ghost"
                    aria-label="Sync with light"
                    color={["blackAlpha.500", "whiteAlpha.500"]}
                    icon={
                      <ChevronIcon
                        fontSize="1.5rem"
                        transform="rotate(90deg)"
                      />
                    }
                    isRounded
                    right="0"
                    _hover={{
                      bg: ["blackAlpha.100", "whiteAlpha.100"],
                    }}
                    onClick={() =>
                      onEdit({ id, name, hex: [darkHex, darkHex] })
                    }
                  />
                </Tooltip>
              </VStack>

              <HexToggleItem
                display={{
                  base: "block",
                  md: colorMode === "light" ? "none" : "block",
                  lg: "block",
                  xl: colorMode === "light" ? "none" : "block",
                }}
                {...{ id, name, colorMode: "dark", hex }}
              />
            </HexProvider>
          </ReorderItem>
        )
      })}
    </Reorder>
  )
})

HexReorder.displayName = "HexReorder"

interface HexToggleItemProps extends Omit<BoxProps, "id">, ReorderColor {
  colorMode: ColorMode
}

const HexToggleItem: FC<HexToggleItemProps> = memo(
  ({ id, name, colorMode, display, hex, ...rest }) => {
    const { tab } = usePalette()
    const resolvedHex = hex[colorMode === "light" ? 0 : 1]
    const isPalettes = tab === "palettes"

    return (
      <Box
        sx={{
          "[data-group]:first-of-type &": {
            roundedTop: "2xl",
          },
          "[data-group]:last-of-type &": {
            roundedBottom: "2xl",
          },
        }}
        display={display}
        overflow="hidden"
      >
        {isPalettes ? (
          <HexControl
            id={id}
            name={name}
            colorMode={colorMode}
            hex={hex}
            {...rest}
          />
        ) : (
          <HexData hex={resolvedHex} {...rest} />
        )}
      </Box>
    )
  },
)

HexToggleItem.displayName = "HexToggleItem"

interface HexControlProps extends ReorderColor {
  colorMode: ColorMode
}

const HexControl: FC<HexControlProps> = memo(
  ({ id, name, colorMode, hex, ...rest }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { format } = useApp()
    const { uuid } = usePalette()
    const resolvedHex = hex[colorMode === "light" ? 0 : 1]

    return (
      <ColorCommandMenu name={name} uuid={uuid} value={resolvedHex}>
        <Box
          ref={containerRef}
          data-group
          alignItems="center"
          bg={resolvedHex}
          display="flex"
          gap="md"
          h="20"
          pe="md"
          ps={{ base: "md", sm: "normal" }}
          {...rest}
        >
          <ReorderTrigger
            color={isLight(resolvedHex) ? "blackAlpha.500" : "whiteAlpha.500"}
            display={{ base: "block", sm: "none" }}
            opacity={0}
            pointerEvents={{ base: "auto", sm: "none" }}
            transitionDuration="slower"
            transitionProperty="common"
            _groupHover={{
              opacity: { base: 1, sm: 0 },
            }}
          >
            <GripVertical fontSize="1.5rem" />
          </ReorderTrigger>

          <VStack
            as={NextLink}
            href={`/colors/${resolvedHex.replace("#", "")}`}
            color={isLight(resolvedHex) ? "blackAlpha.500" : "whiteAlpha.500"}
            gap="0"
            minW="0"
            outline={0}
            prefetch
            rounded="md"
            transitionDuration="slower"
            transitionProperty="common"
            _focusVisible={{ boxShadow: "outline" }}
            _groupHover={{ color: isLight(resolvedHex) ? "black" : "white" }}
          >
            <Text as="span" lineClamp={1}>
              {name}
            </Text>

            <Text as="span" fontSize="sm" lineClamp={1}>
              {f(resolvedHex, format)}
            </Text>
          </VStack>

          <Box
            opacity={{ base: 0, sm: 1 }}
            transitionDuration="slower"
            transitionProperty="common"
            _groupHover={{
              opacity: 1,
            }}
          >
            <HexControlButtons
              colorMode={colorMode}
              onEditClose={() => {
                if (containerRef.current)
                  delete containerRef.current.dataset.hover
              }}
              onEditOpen={() => {
                if (containerRef.current)
                  containerRef.current.dataset.hover = ""
              }}
              {...{ id, name, hex }}
            />
          </Box>
        </Box>
      </ColorCommandMenu>
    )
  },
)

HexControl.displayName = "HexControl"

const getHexes = (hex: string, tab: string) => {
  try {
    switch (tab) {
      case "shades":
        return darken(hex)

      case "tints":
        return lighten(hex)

      case "tones":
        return tone(hex)

      case "blindness":
        return Object.values(blindness(hex))

      default:
        return [hex]
    }
  } catch {
    return []
  }
}

interface HexDataProps extends Pick<Color, "hex"> {}

const HexData: FC<HexDataProps> = memo(({ hex, ...rest }) => {
  const { tab, uuid } = usePalette()
  const [hexes, setHexes] = useState<string[]>(getHexes(hex, tab))
  const count = hexes.length

  useUpdateEffect(() => {
    if (tab) setHexes(getHexes(hex, tab))
  }, [hex, tab])

  return (
    <Box as="nav" h="20" overflow="hidden" {...rest}>
      <Grid as="ul" h="full" templateColumns={`repeat(${count}, 1fr)`}>
        {hexes.map((hex, index) => (
          <GridItem key={`${hex}-${index}`} as="li" boxSize="full">
            <ColorCommandMenu uuid={uuid} value={hex}>
              <Center
                as={NextLink}
                href={`/colors/${hex.replace("#", "")}`}
                bg={hex}
                boxSize="full"
                color={isLight(hex) ? "blackAlpha.500" : "whiteAlpha.500"}
                tabIndex={-1}
              />
            </ColorCommandMenu>
          </GridItem>
        ))}
      </Grid>
    </Box>
  )
})

HexData.displayName = "HexData"
