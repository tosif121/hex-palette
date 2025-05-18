import type { DialogProps } from "@yamada-ui/react"
import type { FC, RefObject } from "react"
import {
  assignRef,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  useDisclosure,
} from "@yamada-ui/react"

import { memo, useRef, useState } from "react"

export interface PaletteRenameModalProps
  extends Omit<DialogProps, "isOpen" | "onClose" | "onSubmit"> {
  value: string
  onOpenRef: RefObject<() => void>
  onSubmit: (value: string) => void
}

export const PaletteRenameModal: FC<PaletteRenameModalProps> = memo(
  ({ value: valueProp, onOpenRef, onSubmit, ...rest }) => {
    const [value, setValue] = useState<string>(valueProp)
    const { isOpen, onClose, onOpen } = useDisclosure({
      onClose: () => {
        setValue((prev) => (!prev.length ? valueProp : prev))
      },
    })
    const isComposition = useRef<boolean>(false)

    assignRef(onOpenRef, onOpen)

    return (
      <Dialog
        isOpen={isOpen}
        withCloseButton={false}
        onClose={onClose}
        {...rest}
      >
        <DialogHeader>Rename</DialogHeader>
        <DialogBody>
          <Input
            placeholder="Palette name"
            value={value}
            onChange={(ev) => setValue(ev.target.value)}
            onCompositionEnd={() => {
              isComposition.current = false
            }}
            onCompositionStart={() => {
              isComposition.current = true
            }}
            onKeyDown={(ev) => {
              if (ev.key !== "Enter") return
              if (isComposition.current) return
              if (!value.length) return

              onClose()
              onSubmit(value)
            }}
          />
        </DialogBody>

        <DialogFooter>
          <Button colorScheme="neutral" variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            colorScheme="primary"
            isDisabled={!value.length}
            onClick={() => {
              onClose()
              onSubmit(value)
            }}
          >
            Rename
          </Button>
        </DialogFooter>
      </Dialog>
    )
  },
)

PaletteRenameModal.displayName = "PaletteRenameModal"
