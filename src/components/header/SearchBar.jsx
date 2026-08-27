import { SfInput, SfButton, SfIconSearch } from "@storefront-ui/react";

const SearchBar = ({ inputValue, setInputValue, onSubmit, className }) => (
  <form role="search" className={className} onSubmit={onSubmit}>
    <SfInput
      value={inputValue}
      type="search"
      placeholder="Search palak, atta, paneer…"
      className="!bg-transparent [&::-webkit-search-cancel-button]:appearance-none"
            wrapperClassName="flex-1 min-w-0 h-10 !rounded-none !bg-transparent !ring-0 hover:!ring-0 focus-within:!ring-0 active:!ring-0 focus-within:!outline-none border-0 border-b border-rule px-0 pr-0"
      size="base"
      slotSuffix={
        <SfButton
          variant="tertiary"
          square
          aria-label="search"
          type="submit"
          className="rounded-none !text-ink hover:bg-transparent active:bg-transparent"
        >
          <SfIconSearch />
        </SfButton>
      }
      onChange={(e) => setInputValue(e.target.value)}
    />
  </form>
);

export default SearchBar;
