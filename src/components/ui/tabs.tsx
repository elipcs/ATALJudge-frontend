import * as React from "react"

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[]
  defaultIndex?: number
}

export function Tabs({ tabs, defaultIndex = 0 }: TabsProps) {
  const [active, setActive] = React.useState(defaultIndex)
  return (
    <div>
      <div className="flex border-b mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 -mb-px border-b-2 font-medium focus:outline-none transition-colors ${
              active === idx
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-indigo-700 hover:border-indigo-300"
            }`}
            onClick={() => setActive(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  )
}
