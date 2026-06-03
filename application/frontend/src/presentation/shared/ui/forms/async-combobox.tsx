import {
  Box,
  Combobox,
  Input,
  InputBase,
  Loader,
  ScrollArea,
  Text,
  useVirtualizedCombobox,
} from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

const DEFAULT_OPTION_HEIGHT = 40;
const DEFAULT_OVERSCAN = 6;
const DEFAULT_VISIBLE_OPTIONS = 6;
const LOAD_MORE_THRESHOLD = DEFAULT_OPTION_HEIGHT * 2;

interface AsyncComboboxOption {
  readonly value: string;
  readonly label: string;
}

interface AsyncComboboxProps {
  readonly ariaLabel: string;
  readonly disabled?: boolean;
  readonly emptyLabel: string;
  readonly hasMore?: boolean;
  readonly id?: string;
  readonly isLoading?: boolean;
  readonly isLoadingMore?: boolean;
  readonly loadingLabel?: string;
  readonly noResultsLabel: string;
  readonly onChange: (value: string | null) => void;
  readonly onDropdownOpen?: () => void;
  readonly onLoadMore?: () => void;
  readonly onSearchChange?: (value: string) => void;
  readonly options: readonly AsyncComboboxOption[];
  readonly placeholder: string;
  readonly searchAriaLabel: string;
  readonly searchPlaceholder: string;
  readonly selectedLabel?: string | null;
  readonly value: string | null;
  readonly rightSection?: ReactNode;
}

function getVisibleStateLabel({
  emptyLabel,
  isLoading,
  loadingLabel,
  noResultsLabel,
  search,
}: {
  readonly emptyLabel: string;
  readonly isLoading: boolean;
  readonly loadingLabel?: string;
  readonly noResultsLabel: string;
  readonly search: string;
}): string {
  if (isLoading) {
    return loadingLabel ?? emptyLabel;
  }

  return search.length > 0 ? noResultsLabel : emptyLabel;
}

export function AsyncCombobox({
  ariaLabel,
  disabled = false,
  emptyLabel,
  hasMore = false,
  id,
  isLoading = false,
  isLoadingMore = false,
  loadingLabel,
  noResultsLabel,
  onChange,
  onDropdownOpen,
  onLoadMore,
  onSearchChange,
  options,
  placeholder,
  searchAriaLabel,
  searchPlaceholder,
  selectedLabel,
  value,
  rightSection,
}: AsyncComboboxProps) {
  const generatedId = useId();
  const comboboxId = id ?? generatedId;
  const [search, setSearch] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);
  const comboboxRef = useRef<ReturnType<typeof useVirtualizedCombobox> | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(() => {
    const option = options.find((candidate) => candidate.value === value);

    if (option) {
      return option;
    }

    return value !== null && selectedLabel ? { value, label: selectedLabel } : null;
  }, [options, selectedLabel, value]);

  const resolveOptionId = useCallback(
    (index: number) => (options[index] ? `${comboboxId}-option-${index}` : null),
    [comboboxId, options],
  );

  const handleOptionIndexSubmit = useCallback(
    (index: number) => {
      const option = options[index];

      if (!option) {
        return;
      }

      onChange(option.value);
      setSearch('');
      onSearchChange?.('');
      comboboxRef.current?.closeDropdown();
    },
    [onChange, onSearchChange, options],
  );

  const combobox = useVirtualizedCombobox({
    getOptionId: resolveOptionId,
    onDropdownClose: () => {
      comboboxRef.current?.resetSelectedOption();
      setSearch('');
      onSearchChange?.('');
    },
    onDropdownOpen: () => {
      onDropdownOpen?.();
      requestAnimationFrame(() => {
        comboboxRef.current?.focusSearchInput();
      });
    },
    onSelectedOptionSubmit: handleOptionIndexSubmit,
    selectedOptionIndex,
    setSelectedOptionIndex,
    totalOptionsCount: options.length,
  });
  comboboxRef.current = combobox;

  const rowVirtualizer = useVirtualizer({
    count: options.length,
    estimateSize: () => DEFAULT_OPTION_HEIGHT,
    getScrollElement: () => viewportRef.current,
    initialRect: { height: DEFAULT_OPTION_HEIGHT * DEFAULT_VISIBLE_OPTIONS, width: 0 },
    overscan: DEFAULT_OVERSCAN,
  });

  useEffect(() => {
    if (options.length === 0) {
      setSelectedOptionIndex(-1);
      return;
    }

    const nextSelectedIndex =
      value === null ? 0 : options.findIndex((option) => option.value === value);

    setSelectedOptionIndex(nextSelectedIndex >= 0 ? nextSelectedIndex : 0);
  }, [options, value]);

  useEffect(() => {
    if (!combobox.dropdownOpened || selectedOptionIndex < 0) {
      return;
    }

    rowVirtualizer.scrollToIndex(selectedOptionIndex, { align: 'auto' });
  }, [combobox.dropdownOpened, rowVirtualizer, selectedOptionIndex]);

  const handleScrollPositionChange = useCallback(
    ({ y }: { readonly y: number }) => {
      const viewport = viewportRef.current;

      if (!viewport || !hasMore || !onLoadMore || isLoading || isLoadingMore) {
        return;
      }

      const remainingScroll = viewport.scrollHeight - y - viewport.clientHeight;

      if (remainingScroll <= LOAD_MORE_THRESHOLD) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, isLoadingMore, onLoadMore],
  );

  const visibleStateLabel = getVisibleStateLabel({
    emptyLabel,
    isLoading,
    loadingLabel,
    noResultsLabel,
    search,
  });

  const targetRightSection = isLoading || isLoadingMore ? <Loader size="xs" /> : rightSection;

  return (
    <Combobox
      onOptionSubmit={(submittedValue) => {
        onChange(String(submittedValue));
        setSearch('');
        onSearchChange?.('');
        combobox.closeDropdown();
      }}
      store={combobox}
      withinPortal={false}
    >
      <Combobox.Target>
        <InputBase
          aria-label={ariaLabel}
          component="button"
          disabled={disabled}
          id={comboboxId}
          onClick={() => combobox.toggleDropdown()}
          pointer
          rightSection={targetRightSection ?? <Combobox.Chevron />}
          type="button"
        >
          {selectedOption ? (
            selectedOption.label
          ) : (
            <Input.Placeholder>{placeholder}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          aria-label={searchAriaLabel}
          onChange={(event) => {
            const nextSearch = event.currentTarget.value;

            setSearch(nextSearch);
            onSearchChange?.(nextSearch);
            combobox.openDropdown();
          }}
          placeholder={searchPlaceholder}
          value={search}
        />

        <Combobox.Options>
          {options.length === 0 ? (
            <Combobox.Empty>{visibleStateLabel}</Combobox.Empty>
          ) : (
            <ScrollArea.Autosize
              mah={DEFAULT_OPTION_HEIGHT * DEFAULT_VISIBLE_OPTIONS}
              offsetScrollbars="y"
              onScrollPositionChange={handleScrollPositionChange}
              scrollbarSize="0.5rem"
              type="scroll"
              viewportRef={viewportRef}
            >
              <Box h={rowVirtualizer.getTotalSize()} pos="relative">
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const option = options[virtualItem.index];

                  if (!option) {
                    return null;
                  }

                  return (
                    <Box
                      key={option.value}
                      left={0}
                      pos="absolute"
                      right={0}
                      style={{ transform: `translateY(${virtualItem.start}px)` }}
                      top={0}
                    >
                      <Combobox.Option
                        active={virtualItem.index === selectedOptionIndex}
                        id={resolveOptionId(virtualItem.index) ?? undefined}
                        onMouseEnter={() => setSelectedOptionIndex(virtualItem.index)}
                        selected={option.value === value}
                        value={option.value}
                      >
                        {option.label}
                      </Combobox.Option>
                    </Box>
                  );
                })}
              </Box>
            </ScrollArea.Autosize>
          )}
        </Combobox.Options>

        {isLoadingMore ? (
          <Combobox.Footer>
            <Box px="sm" py="xs">
              <Text size="sm">{loadingLabel ?? emptyLabel}</Text>
            </Box>
          </Combobox.Footer>
        ) : null}
      </Combobox.Dropdown>
    </Combobox>
  );
}
