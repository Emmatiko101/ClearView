// @ts-strict-ignore
import { type CSSProperties } from 'react';

import { t } from 'i18next';

import { type useSpreadsheet } from 'loot-core/src/client/SpreadsheetProvider';
import { send } from 'loot-core/src/platform/client/fetch';
import * as monthUtils from 'loot-core/src/shared/months';
import { type Handlers } from 'loot-core/src/types/handlers';
import {
  type CategoryEntity,
  type CategoryGroupEntity,
} from 'loot-core/src/types/models';
import { type SyncedPrefs } from 'loot-core/src/types/prefs';

import { styles, theme } from '../../style';
import { type DropPosition } from '../sort';

import { getValidMonthBounds } from './MonthsContext';

export function addToBeBudgetedGroup(groups: CategoryGroupEntity[]) {
  return [
    {
      id: 'to-be-budgeted',
      name: t('To Be Budgeted'),
      categories: [
        {
          id: 'to-be-budgeted',
          name: t('To Be Budgeted'),
          cat_group: 'to-be-budgeted',
          group: {
            id: 'to-be-budgeted',
            name: t('To Be Budgeted'),
          },
        },
      ],
    },
    ...groups,
  ];
}

export function removeCategoriesFromGroups(
  categoryGroups: CategoryGroupEntity[],
  ...categoryIds: CategoryEntity['id'][]
) {
  if (!categoryIds || categoryIds.length === 0) return categoryGroups;

  const categoryIdsSet = new Set(categoryIds);

  return categoryGroups
    .map(group => ({
      ...group,
      categories:
        group.categories?.filter(cat => !categoryIdsSet.has(cat.id)) ?? [],
    }))
    .filter(group => group.categories?.length);
}

export function separateGroups(categoryGroups: CategoryGroupEntity[]) {
  return [
    categoryGroups.filter(g => !g.is_income),
    categoryGroups.find(g => g.is_income),
  ] as const;
}

export function makeAmountGrey(value: number | string): CSSProperties {
  return value === 0 || value === '0' || value === '' || value == null
    ? { color: theme.tableTextSubdued }
    : null;
}

export function makeBalanceAmountStyle(
  value: number,
  goalValue?: number,
  budgetedValue?: number,
) {
  if (value < 0) {
    return { color: theme.errorText };
  }

  if (goalValue == null) {
    const greyed = makeAmountGrey(value);
    if (greyed) {
      return greyed;
    }
  } else {
    if (budgetedValue < goalValue) {
      return { color: theme.warningText };
    }
    return { color: theme.noticeText };
  }
}

export function makeAmountFullStyle(
  value: number,
  colors?: {
    positiveColor?: string;
    negativeColor?: string;
    zeroColor?: string;
  },
) {
  const positiveColorToUse = colors?.positiveColor || theme.noticeText;
  const negativeColorToUse = colors?.negativeColor || theme.errorText;
  const zeroColorToUse = colors?.zeroColor || theme.tableTextSubdued;
  return {
    color:
      value < 0
        ? negativeColorToUse
        : value === 0
          ? zeroColorToUse
          : positiveColorToUse,
  };
}

export function findSortDown(
  arr: CategoryGroupEntity[],
  pos: DropPosition,
  targetId: string,
) {
  if (pos === 'top') {
    return { targetId };
  } else {
    const idx = arr.findIndex(item => item.id === targetId);

    if (idx === -1) {
      throw new Error('findSort: item not found: ' + targetId);
    }

    const newIdx = idx + 1;
    if (newIdx < arr.length) {
      return { targetId: arr[newIdx].id };
    } else {
      // Move to the end
      return { targetId: null };
    }
  }
}

export function findSortUp(
  arr: CategoryGroupEntity[],
  pos: DropPosition,
  targetId: string,
) {
  if (pos === 'bottom') {
    return { targetId };
  } else {
    const idx = arr.findIndex(item => item.id === targetId);

    if (idx === -1) {
      throw new Error('findSort: item not found: ' + targetId);
    }

    const newIdx = idx - 1;
    if (newIdx >= 0) {
      return { targetId: arr[newIdx].id };
    } else {
      // Move to the beginning
      return { targetId: null };
    }
  }
}

export function getScrollbarWidth() {
  return Math.max(styles.scrollbarWidth - 2, 0);
}

export async function prewarmMonth(
  budgetType: SyncedPrefs['budgetType'],
  spreadsheet: ReturnType<typeof useSpreadsheet>,
  month: string,
) {
  const method: keyof Handlers =
    budgetType === 'report' ? 'tracking-budget-month' : 'envelope-budget-month';

  const values = await send(method, { month });

  for (const value of values) {
    spreadsheet.prewarmCache(value.name, value);
  }
}

export async function prewarmAllMonths(
  budgetType: SyncedPrefs['budgetType'],
  spreadsheet: ReturnType<typeof useSpreadsheet>,
  bounds: { start: string; end: string },
  startMonth: string,
) {
  const numMonths = 3;

  bounds = getValidMonthBounds(
    bounds,
    monthUtils.subMonths(startMonth, 1),
    monthUtils.addMonths(startMonth, numMonths + 1),
  );
  const months = monthUtils.rangeInclusive(bounds.start, bounds.end);

  await Promise.all(
    months.map(month => prewarmMonth(budgetType, spreadsheet, month)),
  );
}