import React, {
  type RefObject,
  type UIEventHandler,
  type CSSProperties,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  type balanceTypeOpType,
  type IntervalEntity,
} from 'loot-core/src/types/models/reports';

import { theme } from '../../../../style';
import { View } from '../../../common/View';
import { Row, Cell } from '../../../table';
import { ReportOptions } from '../../ReportOptions';

type ReportTableHeaderProps = {
  groupBy: string;
  interval: string;
  data: IntervalEntity[];
  balanceTypeOp: balanceTypeOpType;
  headerScrollRef: RefObject<HTMLDivElement>;
  handleScroll: UIEventHandler<HTMLDivElement>;
  compact: boolean;
  style?: CSSProperties;
  compactStyle?: CSSProperties;
  mode: string;
};

export function ReportTableHeader({
  groupBy,
  interval,
  data,
  balanceTypeOp,
  headerScrollRef,
  handleScroll,
  compact,
  style,
  compactStyle,
  mode,
}: ReportTableHeaderProps) {
  const { t } = useTranslation();
  return (
    <Row
      collapsed={true}
      style={{
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: theme.tableBorder,
        color: theme.tableHeaderText,
        backgroundColor: theme.tableHeaderBackground,
        fontWeight: 600,
        ...style,
      }}
    >
      <View
        innerRef={headerScrollRef}
        onScroll={handleScroll}
        id="header"
        style={{
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': { display: 'none' },
          flexDirection: 'row',
          flex: 1,
        }}
      >
        <Cell
          style={{
            width: compact ? 80 : 125,
            flexShrink: 0,
            flexGrow: 1,
          }}
          valueStyle={compactStyle}
          value={
            groupBy === 'Interval'
              ? ReportOptions.intervalMap.get(interval)
              : groupBy
          }
        />
        {mode === 'time'
          ? data.map((header, index) => {
              return (
                <Cell
                  style={{
                    minWidth: compact ? 50 : 85,
                  }}
                  valueStyle={compactStyle}
                  key={index}
                  value={header.date}
                  width="flex"
                />
              );
            })
          : balanceTypeOp === 'totalTotals' && (
              <>
                <Cell
                  style={{
                    minWidth: compact ? 50 : 85,
                  }}
                  valueStyle={compactStyle}
                  value={t('Deposits')}
                  width="flex"
                />
                <Cell
                  style={{
                    minWidth: compact ? 50 : 85,
                  }}
                  valueStyle={compactStyle}
                  value={t('Payments')}
                  width="flex"
                />
              </>
            )}
        <Cell
          style={{
            minWidth: compact ? 50 : 85,
          }}
          valueStyle={compactStyle}
          value={t('Totals')}
          width="flex"
        />
        <Cell
          style={{
            minWidth: compact ? 50 : 85,
          }}
          valueStyle={compactStyle}
          value={t('Average')}
          width="flex"
        />
      </View>
    </Row>
  );
}