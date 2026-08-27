import {
  SfDrawer,
  SfButton,
  SfIconClose,
  SfListItem,
  SfIconArrowBack,
  SfIconChevronRight,
} from "@storefront-ui/react";
import { NavLink } from "react-router";
import StoreSelector from "./StoreSelector";
import Wordmark from "../Wordmark";

const MobileDrawer = ({
  drawerRef,
  isMobileDrawerOpen,
  closeMobileDrawer,
  stores,
  selectedStore,
  handleStoreChange,
  activeMenu,
  handleBack,
  handleNext,
  bannerNode,
}) => (
  <>
    <div className="md:hidden fixed inset-0 bg-neutral-500 bg-opacity-50 z-[2]" />
    <SfDrawer
      ref={drawerRef}
      open={isMobileDrawerOpen}
      onClose={closeMobileDrawer}
      placement="left"
      className="md:hidden right-3 max-w-[min(22rem,calc(100vw-1.5rem))] bg-paper overflow-y-auto z-20"
    >
      <nav>
        <div className="flex items-center justify-between border-b border-rule p-4">
          <Wordmark className="text-3xl" />
          <SfButton
            onClick={closeMobileDrawer}
            variant="tertiary"
            square
            aria-label="Close menu"
            className="ml-2"
          >
            <SfIconClose className="text-neutral-500" />
          </SfButton>
        </div>

        {/* Mobile Select Store */}
        <div className="border-b border-rule p-4">
          <label className="mb-2 block text-sm text-ink/70">
            Select store
          </label>
          <StoreSelector
            stores={stores}
            selectedStore={selectedStore}
            onChange={handleStoreChange}
            className="w-full border-0 border-b border-rule bg-transparent px-0 py-1"
          />
        </div>

        <ul className="mt-2 mb-6">
          {activeMenu && activeMenu.key !== "root" && (
            <li>
              <SfListItem
                size="lg"
                as="button"
                type="button"
                onClick={handleBack}
                className="border-b border-b-neutral-200 border-b-solid"
              >
                <div className="flex items-center">
                  <SfIconArrowBack className="text-neutral-500" />
                  <p className="ml-5 font-medium">{activeMenu.value.label}</p>
                </div>
              </SfListItem>
            </li>
          )}
          {activeMenu?.children?.map((node) =>
            node.isLeaf ? (
              <li key={node.key}>
                <SfListItem
                  size="lg"
                  as={NavLink}
                  to={node.value.link}
                  onClick={closeMobileDrawer}
                  className="first-of-type:mt-2"
                >
                  <div className="flex items-center">
                    <p className="text-left">{node.value.label}</p>
                  </div>
                </SfListItem>
              </li>
            ) : (
              <li key={node.key}>
                <SfListItem
                  size="lg"
                  as="button"
                  type="button"
                  onClick={handleNext(node.key)}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-left">{node.value.label}</p>
                    <SfIconChevronRight className="text-neutral-500" />
                  </div>
                </SfListItem>
              </li>
            )
          )}
        </ul>

        {bannerNode?.value?.banner && (
          <div className="flex flex-col items-center overflow-hidden bg-neutral-100 border-neutral-300 grow">
            <img
              src={bannerNode.value.banner}
              alt={bannerNode.value.bannerTitle}
              className="w-1/2 h-[150px] object-cover"
            />
            <p className="basis-6/12 p-6 font-medium typography-text-base">
              {bannerNode.value.bannerTitle}
            </p>
          </div>
        )}
      </nav>
    </SfDrawer>
  </>
);

export default MobileDrawer;
