import type { FC, MutableRefObject } from "react"
import {
  ScrollArea,
  SegmentedControl,
  SegmentedControlButton,
} from "@yamada-ui/react"
import { CONSTANT } from "constant"

import { useState } from "react"

export interface TabsProps {
  hex: string
  tab: string
  onSelectRef: MutableRefObject<(tab: string, hex: string) => void>
}

export const Tabs: FC<TabsProps> = ({ hex, tab: tabProp, onSelectRef }) => {
  const [tab, setTab] = useState<string>(tabProp)

  return (
    <ScrollArea as="section" type="never" tabIndex={-1}>
      <SegmentedControl variant="tabs" value={tab} w="full">
        {CONSTANT.ENUM.GENERATORS.map((tab) => {
          return (
            <SegmentedControlButton
              key={tab}
              tabIndex={-1}
              value={tab}
              onClick={() => {
                setTab(tab)
                onSelectRef.current(tab, hex)
              }}
            >
              {tab === "shades" && "Shades"}
              {tab === "tints" && "Tints"}
              {tab === "tones" && "Tones"}
              {tab === "alternatives" && "Alternatives"}
              {tab === "hues" && "Hues"}
            </SegmentedControlButton>
          )
        })}
      </SegmentedControl>
    </ScrollArea>
  )
}
