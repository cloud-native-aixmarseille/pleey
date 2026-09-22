import { List } from '@mantine/core';
import type { PropsWithChildren } from 'react';

export function ContentList({ children }: PropsWithChildren) {
  return (
    <List listStyleType="none" spacing="sm">
      {children}
    </List>
  );
}

export function ContentListItem({ children }: PropsWithChildren) {
  return <List.Item styles={{ itemWrapper: { display: 'block' } }}>{children}</List.Item>;
}
