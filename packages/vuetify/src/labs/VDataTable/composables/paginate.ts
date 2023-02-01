// Composables
import { useProxiedModel } from '@/composables/proxiedModel'

// Utilities
import { computed, inject, provide, watchEffect } from 'vue'
import { clamp, propsFactory } from '@/util'

// Types
import type { InjectionKey, Ref } from 'vue'
import type { InternalItem } from '@/composables/items'
import type { DataTableItem } from '../types'

export const makeDataTablePaginateProps = propsFactory({
  page: {
    type: [Number, String],
    default: 1,
  },
  itemsPerPage: {
    type: [Number, String],
    default: 10,
  },
}, 'v-data-table-paginate')

const VDataTablePaginationSymbol: InjectionKey<{
  page: Ref<number>
  itemsPerPage: Ref<number>
  startIndex: Ref<number>
  stopIndex: Ref<number>
  pageCount: Ref<number>
  itemsLength: Ref<number>
  prevPage: () => void
  nextPage: () => void
  setPage: (value: number) => void
  setItemsPerPage: (value: number) => void
}> = Symbol.for('vuetify:data-table-pagination')

type PaginationProps = {
  page: number | string
  'onUpdate:page': ((val: any) => void) | undefined
  itemsPerPage: number | string
  'onUpdate:itemsPerPage': ((val: any) => void) | undefined
  itemsLength?: number | string
}

export function createPagination (props: PaginationProps, items: Ref<any[]>) {
  const page = useProxiedModel(props, 'page', undefined, value => +(value ?? 1))
  const itemsPerPage = useProxiedModel(props, 'itemsPerPage', undefined, value => +(value ?? 10))
  const itemsLength = computed(() => +(props.itemsLength ?? items.value.length))

  const startIndex = computed(() => {
    if (itemsPerPage.value === -1) return 0

    return itemsPerPage.value * (page.value - 1)
  })
  const stopIndex = computed(() => {
    if (itemsPerPage.value === -1) return itemsLength.value

    return Math.min(itemsLength.value, startIndex.value + itemsPerPage.value)
  })

  const pageCount = computed(() => {
    if (itemsPerPage.value === -1) return 1

    return Math.ceil(itemsLength.value / itemsPerPage.value)
  })

  watchEffect(() => {
    if (startIndex.value > itemsLength.value) {
      page.value = 1
    }
  })

  function nextPage () {
    page.value = clamp(page.value + 1, 1, pageCount.value)
  }

  function prevPage () {
    page.value = clamp(page.value - 1, 1, pageCount.value)
  }

  function setPage (value: number) {
    page.value = clamp(value, 0, pageCount.value)
  }

  function setItemsPerPage (value: number) {
    itemsPerPage.value = value
  }

  const data = { page, itemsPerPage, startIndex, stopIndex, pageCount, itemsLength, nextPage, prevPage, setPage, setItemsPerPage }

  provide(VDataTablePaginationSymbol, data)

  return data
}

export function usePagination () {
  const data = inject(VDataTablePaginationSymbol)

  if (!data) throw new Error('Missing pagination!')

  return data
}

export function usePaginatedItems <T extends InternalItem = DataTableItem> (
  items: Ref<T[]>,
  startIndex: Ref<number>,
  stopIndex: Ref<number>,
  itemsPerPage: Ref<number>
) {
  const paginatedItems = computed(() => {
    if (itemsPerPage.value <= 0) return items.value

    return items.value.slice(startIndex.value, stopIndex.value)
  })

  return { paginatedItems }
}
