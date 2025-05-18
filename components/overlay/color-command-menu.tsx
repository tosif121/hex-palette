import type {
  ContextMenuProps,
  ContextMenuTriggerProps,
} from "@yamada-ui/react"
import type { FC } from "react"
import {
  Button,
  ContextMenu,
  ContextMenuTrigger,
  forwardRef,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalFooter,
  noop,
  Text,
  useClipboard,
  useDisclosure,
  useNotice,
} from "@yamada-ui/react"
import { CopiedColorNotice } from "components/feedback"
import { PaletteColorForm } from "components/forms"
import { CONSTANT } from "constant"
import { useApp } from "contexts/app-context"

import { useRouter } from "next/router"
import { useHex, useHexes } from "pages/palettes/[uuid]/context"
import { memo, useMemo, useRef, useState } from "react"
import { getColorName } from "utils/color-name-list"

export interface ColorCommandMenuProps extends ContextMenuProps {
  value: string
  name?: string
  hiddenGenerators?: boolean
  uuid?: string
  triggerProps?: ContextMenuTriggerProps
}

export const ColorCommandMenu = memo(
  forwardRef<ColorCommandMenuProps, "div">(
    (
      {
        value,
        name = getColorName(value),
        children,
        hiddenGenerators,
        uuid,
        triggerProps,
        ...rest
      },
      ref,
    ) => {
      const { palettes } = useApp()

      const omittedPalettes = useMemo(
        () => palettes.filter((palette) => uuid !== palette.uuid),
        [palettes, uuid],
      )

      const hasPalettes = !!omittedPalettes.length

      return (
        <ContextMenu
          modifiers={[
            {
              name: "preventOverflow",
              options: {
                padding: {
                  bottom: 16,
                  left: 16,
                  right: 16,
                  top: 16,
                },
              },
            },
          ]}
          {...rest}
        >
          <ContextMenuTrigger ref={ref} h="full" {...triggerProps}>
            {children}
          </ContextMenuTrigger>

          <MenuList maxW="sm">
            <ColorCommandMenuMain value={value} />

            {!!uuid ? (
              <>
                <MenuDivider />

                <ColorCommandMenuPaletteColor />
              </>
            ) : null}

            {!hiddenGenerators ? (
              <>
                <MenuDivider />

                <ColorCommandMenuGenerators value={value} />
              </>
            ) : null}

            {!!uuid ? (
              <>
                <MenuDivider />

                <ColorCommandMenuPalette />
              </>
            ) : null}

            {hasPalettes ? (
              <>
                <MenuDivider />

                <ColorCommandMenuPalettes
                  name={name}
                  palettes={omittedPalettes}
                  value={value}
                />
              </>
            ) : null}
          </MenuList>
        </ContextMenu>
      )
    },
  ),
)

ColorCommandMenu.displayName = "ColorCommandMenu"

interface ColorCommandMenuMainProps {
  value: string
}

const ColorCommandMenuMain: FC<ColorCommandMenuMainProps> = memo(
  ({ value }) => {
    const { onCopy } = useClipboard(value, 5000)
    const notice = useNotice({
      component: () => (
        <CopiedColorNotice value={value}>Copied </CopiedColorNotice>
      ),
      limit: 1,
      placement: "bottom",
    })
    const router = useRouter()

    return (
      <>
        <MenuItem
          onClick={() => {
            router.push(`/colors/${value.replace("#", "")}`)
          }}
        >
          See Info
        </MenuItem>

        <MenuItem
          onClick={() => {
            router.push(
              `/contrast-checker?light.fg=${value.replace("#", "")}&dark.fg=${value.replace("#", "")}`,
            )
          }}
        >
          Check Contrast
        </MenuItem>

        <MenuItem
          onClick={() => {
            onCopy()
            notice()
          }}
        >
          Copy
        </MenuItem>
      </>
    )
  },
)

ColorCommandMenuMain.displayName = "ColorCommandMenuMain"

interface ColorCommandMenuPaletteColorProps {}

const ColorCommandMenuPaletteColor: FC<ColorCommandMenuPaletteColorProps> =
  memo(() => {
    const { id, name: nameProp, hex } = useHex()
    const { colorMode, onDelete, onEdit } = useHexes()
    const isSubmitRef = useRef<boolean>(false)
    const resetRef = useRef<(value: string) => void>(noop)
    const { isOpen, onClose, onOpen } = useDisclosure({
      onClose: () => {
        if (!isSubmitRef.current) {
          setName(nameProp)
          setColor(resolvedHex)
          resetRef.current(resolvedHex)
        }

        isSubmitRef.current = false
      },
    })

    const [lightHex, darkHex] = hex
    const resolvedHex = colorMode === "light" ? lightHex : darkHex
    const [name, setName] = useState<string>(nameProp)
    const [color, setColor] = useState<string>(resolvedHex)

    const onSubmit = () => {
      isSubmitRef.current = true

      const hex: [string, string] =
        colorMode === "light" ? [color, darkHex] : [lightHex, color]

      onEdit({ id, name, hex })

      onClose()
    }

    return (
      <>
        <MenuGroup label="Color">
          <MenuItem closeOnSelect={false} onClick={onOpen}>
            Edit
          </MenuItem>
          <MenuItem onClick={() => onDelete(id)}>Delete</MenuItem>
        </MenuGroup>
        <Modal isOpen={isOpen} withCloseButton={false} onClose={onClose}>
          <ModalBody>
            <PaletteColorForm
              name={name}
              color={color}
              resetRef={resetRef}
              onChangeColor={setColor}
              onChangeName={setName}
              onSubmit={onSubmit}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="neutral"
              bg={["blackAlpha.200", "whiteAlpha.100"]}
              borderColor="transparent"
              isDisabled={!name.length}
              w="full"
              _hover={{ _disabled: {} }}
              onClick={onSubmit}
            >
              Apply
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  })

ColorCommandMenuPaletteColor.displayName = "ColorCommandMenuPaletteColor"

interface ColorCommandMenuPaletteProps {}

const ColorCommandMenuPalette: FC<ColorCommandMenuPaletteProps> = memo(() => {
  const { onClone } = useHexes()
  const paletteColor = useHex()

  return (
    <MenuGroup label="Palette">
      <MenuItem onClick={() => onClone(paletteColor)}>Add to palette</MenuItem>
    </MenuGroup>
  )
})

ColorCommandMenuPalette.displayName = "ColorCommandMenuPalette"

interface ColorCommandMenuGeneratorsProps {
  value: string
}

const ColorCommandMenuGenerators: FC<ColorCommandMenuGeneratorsProps> = memo(
  ({ value }) => {
    const router = useRouter()

    return (
      <MenuGroup label="Generators">
        {CONSTANT.ENUM.GENERATORS.map((tab) => (
          <MenuItem
            key={tab}
            onClick={() => {
              router.push(
                `/generators?hex=${value.replace("#", "")}&tab=${tab}`,
              )
            }}
          >
            {tab === "shades" && "See Shades"}
            {tab === "tints" && "See Tints"}
            {tab === "tones" && "See Tones"}
            {tab === "alternatives" && "See Alternatives"}
            {tab === "hues" && "See Hues"}
          </MenuItem>
        ))}
      </MenuGroup>
    )
  },
)

ColorCommandMenuGenerators.displayName = "ColorCommandMenuGenerators"

interface ColorCommandMenuPalettesProps {
  name: string
  palettes: ColorPalettes
  value: string
}

const ColorCommandMenuPalettes: FC<ColorCommandMenuPalettesProps> = memo(
  ({ name: colorName, palettes, value }) => {
    const { changePalette } = useApp()

    return (
      <MenuGroup label="My Palettes">
        {palettes.map(({ name, colors, uuid, ...rest }) => (
          <MenuItem
            key={uuid}
            onClick={() =>
              changePalette({
                name,
                colors: [...colors, { name: colorName, hex: [value, value] }],
                uuid,
                ...rest,
              })
            }
          >
            <Text as="span" lineClamp={1}>
              Add {value} to {name}
            </Text>
          </MenuItem>
        ))}
      </MenuGroup>
    )
  },
)

ColorCommandMenuPalettes.displayName = "ColorCommandMenuPalettes"
