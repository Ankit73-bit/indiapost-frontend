export const SAMPLE_TYPST_CONTENT = `#set page(margin: 1in)
#set text(font: "Inter", size: 11pt)

#let title = "Quarterly Financial Report"
#let subtitle = "Q3 2024 Analysis"

#align(center)[
  #text(24pt, weight: "bold")[#title]
  #v(0.5em)
  #text(14pt, fill: rgb("#666"))[#subtitle]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    Executive summary for the reporting period. Revenue increased across all regions with strong performance in enterprise accounts.
  ],
  [
    #image("assets/logo.png", width: 100%)
  ],
)

The following table outlines the breakdown by region:
`;

export function getPlaceholderContent(fileName: string): string {
  if (fileName.endsWith('.typ')) {
    return SAMPLE_TYPST_CONTENT;
  }
  return '';
}
