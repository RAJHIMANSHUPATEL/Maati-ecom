import { memo, useEffect, useId, useRef, useState } from "react";
import classNames from "classnames";
import {
  SfIconExpandMore,
  SfListItem,
  useDisclosure,
  useDropdown,
  SfIconCheck,
  useTrapFocus,
  InitialFocusType,
} from "@storefront-ui/react";

// const options = [
//   {
//     label: "Startup",
//     value: "startup",
//   },
//   {
//     label: "Business",
//     value: "business",
//   },
//   {
//     label: "Enterprise",
//     value: "enterprise",
//   },
// ];

const DropdownSelection = ({ options, selected, onSelect }) => {
  const { close, toggle, isOpen } = useDisclosure({ initialValue: false });
  const id = useId();
  const listboxId = useId();
  const selectTriggerRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState(
    options.find((opt) => opt.value === selected) || options[0]
  );

  useEffect(() => {
    setSelectedOption(
      options.find((opt) => opt.value === selected) || options[0]
    );
  }, [selected, options]);

  const { refs, style: dropdownStyle } = useDropdown({
    isOpen,
    onClose: close,
  });

  //   useTrapFocus(refs.floating, {
  //     arrowKeysUpDown: true,
  //     activeState: isOpen,
  //     initialFocus: InitialFocusType.autofocus,
  //     initialFocusContainerFallback: true,
  //   });

  const selectOption = (option) => {
    setSelectedOption(option);
    onSelect(option.value);
    close();
    selectTriggerRef.current?.focus();
  };

  //   const handleTriggerKeyDown = (event) => {
  //     if (event.key === " ") toggle();
  //   };

  //   const handleOptionItemKeyDown = (event, option) => {
  //     if (event.key === " " || event.key === "Enter") {
  //       event.preventDefault();
  //       selectOption(option);
  //     }
  //   };

  return (
    <>
      <div ref={refs.setReference} className="relative min-w-0 max-w-full">
        <div
          ref={selectTriggerRef}
          id={id}
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-label="Select one option"
          aria-activedescendant={
            selectedOption ? `${listboxId}-${selectedOption.value}` : undefined
          }
          className="relative mt-0.5 flex min-w-0 max-w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md px-3 py-2 font-normal typography-text-base ring-1 ring-inset ring-neutral-300 hover:ring-primary-700 focus:ring-2 focus:ring-primary-700 focus-visible:outline focus-visible:outline-offset active:ring-2 active:ring-primary-700"
          tabIndex={0}
          onClick={toggle}
        >
          {selectedOption ? (
            <span className="min-w-0 truncate">{selectedOption.label}</span>
          ) : (
            <span className="truncate text-neutral-500">Choose from the list</span>
          )}
          <SfIconExpandMore
            className={classNames(
              "ml-auto text-neutral-500 transition-transform ease-in-out duration-300",
              {
                "rotate-180": isOpen,
              }
            )}
          />
        </div>
        {isOpen && (
          <ul
            id={listboxId}
            ref={refs.setFloating}
            role="listbox"
            aria-label="Select one option"
            className={classNames(
              "w-full py-2 rounded-md shadow-md border border-neutral-100 bg-white z-20",
              {
                hidden: !isOpen,
              }
            )}
            style={dropdownStyle}
          >
            {options.map((option) => (
              <SfListItem
                id={`${listboxId}-${option.value}`}
                key={option.value}
                role="option"
                tabIndex={0}
                aria-selected={option.value === selectedOption?.value}
                className={classNames("block", {
                  "font-medium": option.value === selectedOption?.value,
                })}
                onClick={() => selectOption(option)}
                slotSuffix={
                  option.value === selectedOption?.value && (
                    <SfIconCheck className="text-primary-700" />
                  )
                }
              >
                {option.label}
              </SfListItem>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default memo(DropdownSelection);
