import type { FlexProps } from "@yamada-ui/react"
import type { FC } from "react"
import { useUpdateEffect, VStack, Wrap } from "@yamada-ui/react"
import { SearchColor } from "components/forms"
import { CopyText } from "components/other"
import { useApp } from "contexts/app-context"

import { memo, useState } from "react"
import { f } from "utils/color"

export interface ContrastSearchProps
  extends ColorContrastSource,
    Omit<FlexProps, "bg" | "onChange"> {
  onChange: (ground: ColorContrastGround, value: string) => void
}

export const ContrastSearch: FC<ContrastSearchProps> = memo(
  ({ bg, fg, onChange, ...rest }) => {
    

    return (
      <Wrap gap="md" {...rest}>
        <ColorInput
          ground="fg"
          label={"Foreground"}
          value={fg}
          onChange={onChange}
        />
        <ColorInput
          ground="bg"
          label={"Background"}
          value={bg}
          onChange={onChange}
        />
      </Wrap>
    )
  },
)

ContrastSearch.displayName = "ContrastSearch"

interface ColorInputProps {
  ground: ColorContrastGround
  label: string
  value: string
  onChange: (ground: ColorContrastGround, value: string) => void
}

const ColorInput: FC<ColorInputProps> = ({
  ground,
  label,
  value: valueProp,
  onChange,
}) => {
  const { format } = useApp()
  const [value, setValue] = useState<string>(f(valueProp, format))

  useUpdateEffect(() => {
    setValue(f(valueProp, format))
  }, [valueProp])

  return (
    <VStack flex="1" gap="xs" minW="xs" w="auto">
      <CopyText
        as="span"
        alignSelf="flex-start"
        color="muted"
        fontSize="sm"
        value={value}
      >
        {label}
      </CopyText>

      <SearchColor
        value={value}
        onChange={setValue}
        onSubmit={(value) => onChange(ground, value)}
      />
    </VStack>
  )
}
