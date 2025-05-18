import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next"
import { categories, Category } from "components/data-display"

import { getRandomColors } from "functions/get-random-colors"
import { AppLayout } from "layouts/app-layout"
import { getServerSideCommonProps } from "utils/next"

export const getServerSideProps = (req: GetServerSidePropsContext) => {
  const {
    props: { cookies, format, hex, palettes },
  } = getServerSideCommonProps(req)

  const omittedCategories = (categories as unknown as string[])
    .sort(() => 0.5 - Math.random())
    .slice(0, 8)

  const computedCategories = omittedCategories.map((category) => {
    const colors = getRandomColors({ category })

    return { category, colors }
  })

  const props = {
    categories: computedCategories,
    cookies,
    format,
    hex,
    palettes,
  }

  return { props }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const Page: NextPage<PageProps> = ({ categories, format, hex, palettes }) => {
  

  return (
    <AppLayout
      title={"Explore"}
      format={format}
      gap={{ base: "lg", sm: "normal" }}
      hex={hex}
      palettes={palettes}
    >
      {categories.map(({ category, colors }, index) => {
        const type = index % 4 === 2 || index % 4 === 3 ? "carousel" : "grid"
        const size = index % 2 === 0 ? "md" : "sm"

        return (
          <Category
            key={category}
            type={type}
            size={size}
            category={category}
            colors={colors}
          />
        )
      })}
    </AppLayout>
  )
}

export default Page
