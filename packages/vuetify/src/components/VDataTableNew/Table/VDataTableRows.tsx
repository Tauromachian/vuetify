import { convertToUnit, createRange, defineComponent } from '@/util'

import type { PropType } from 'vue'
import type { Column } from './Grid/VDataTableGrid'
import { useExpanded, VDataTableExpandedKey } from './Grid/VDataTableGrid'

export const VDataTableRows = defineComponent({
  name: 'VDataTableRows',

  props: {
    columns: {
      type: Array as PropType<any[]>,
      required: true,
    },
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },

  setup (props, { slots }) {
    return () => {
      return (
        <>
          {props.items.map(item => (
            <tr
              class="v-data-table-regular__tr"
              role="row"
              key={ `row_${item.id}` }
            >
              { props.columns.map((column, colIndex) => (
                <td
                  class={[
                    'v-data-table-regular__td',
                    {
                      'v-data-table-regular__td--sticky': column.sticky,
                    },
                  ]}
                  style={{
                    left: column.sticky ? convertToUnit(column.stickyWidth) : undefined,
                  }}
                  role="cell"
                >
                  { slots[`item.${column.id}`]?.() ?? item[column.id] }
                </td>
              )) }
            </tr>
          ))}
        </>
      )
    }
  },
})