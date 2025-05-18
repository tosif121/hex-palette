import type {
  ContextMenuProps,
  ContextMenuTriggerProps,
} from "@yamada-ui/react"
import {
  ContextMenu,
  ContextMenuTrigger,
  Dialog,
  forwardRef,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  noop,
  Text,
  useDisclosure,
} from "@yamada-ui/react"
import { CONSTANT } from "constant"
import { useApp } from "contexts/app-context"

import { useRouter } from "next/router"
import { memo, useRef } from "react"
import { setCookie } from "utils/storage"
import { PaletteRenameModal } from "./palette-rename-modal"

export interface PaletteCommandMenuProps extends ContextMenuProps {
  palette: ColorPalette
  triggerProps?: ContextMenuTriggerProps
}

export const PaletteCommandMenu = memo(
  forwardRef<PaletteCommandMenuProps, "div">(
    ({ children, palette, triggerProps, ...rest }, ref) => {
      const { name, uuid } = palette
      const { changePalette, deletePalette } = useApp()

      const router = useRouter()
      const onOpenRef = useRef<() => void>(noop)
      const { isOpen, onClose, onOpen } = useDisclosure()

      return (
        <>
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
              <MenuItem
                onClick={() => {
                  setCookie(CONSTANT.STORAGE.PALETTE_TAB, "palettes")
                  router.push(`/palettes/${uuid}`)
                }}
              >
                See Info
              </MenuItem>
              <MenuItem onClick={() => onOpenRef.current()}>Rename</MenuItem>
              <MenuItem onClick={onOpen}>Delete</MenuItem>

              <MenuDivider />

              <MenuGroup label="Menu">
                {CONSTANT.ENUM.PALETTE.map((tab) =>
                  tab === "palettes" ? null : (
                    <MenuItem
                      key={tab}
                      onClick={() => {
                        setCookie(CONSTANT.STORAGE.PALETTE_TAB, tab)
                        router.push(`/palettes/${uuid}`)
                      }}
                    >
                      {tab === "blindness" && "See Blindness"}
                      {tab === "shades" && "See Shades"}
                      {tab === "tints" && "See Tints"}
                      {tab === "tones" && "See Tones"}
                    </MenuItem>
                  ),
                )}
              </MenuGroup>
            </MenuList>
          </ContextMenu>

          <PaletteRenameModal
            value={name}
            onOpenRef={onOpenRef}
            onSubmit={(name) => changePalette({ ...palette, name })}
          />

          <Dialog
            cancel={{
              colorScheme: "neutral",
              children: "Cancel",
            }}
            header={<Text lineClamp={1}>{name}</Text>}
            isOpen={isOpen}
            success={{
              colorScheme: "danger",
              children: "Delete",
            }}
            withCloseButton={false}
            onCancel={onClose}
            onClose={onClose}
            onSuccess={() => deletePalette(uuid)}
          >
            Are you sure you want to delete this palette?
          </Dialog>
        </>
      )
    },
  ),
)

PaletteCommandMenu.displayName = "PaletteCommandMenu"
