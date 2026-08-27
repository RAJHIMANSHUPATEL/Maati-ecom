import React, { useState } from 'react';
import {
  SfScrollable,
  SfButton,
  SfIconChevronLeft,
  SfIconChevronRight,
} from '@storefront-ui/react';
import { resolveImageUrl } from '../../utils/imageUrl';
import classNames from 'classnames';

function ProductGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onDragged = (event) => {
    if (event.swipeRight && activeIndex > 0) {
      setActiveIndex((current) => current - 1);
    } else if (event.swipeLeft && activeIndex < images.length - 1) {
      setActiveIndex((current) => current + 1);
    }
  };

  const activeArrowNavigation = (event, index) => {
    event.preventDefault();
    const next = event.target.nextElementSibling;
    const prev = event.target.previousElementSibling;

    if ((event.code === 'ArrowRight' || event.code === 'ArrowUp') && index < images.length - 1) {
      setActiveIndex(index + 1);
      next?.focus();
    } else if ((event.code === 'ArrowLeft' || event.code === 'ArrowDown') && index > 0) {
      setActiveIndex(index - 1);
      prev?.focus();
    }
  };

  return (
    <div className="relative flex flex-col w-full max-h-[600px] aspect-[4/3]">
      {/* Main Image Viewer */}
      <SfScrollable
        className="w-full h-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        activeIndex={activeIndex}
        wrapperClassName="h-full min-h-0"
        buttonsPlacement="none"
        isActiveIndexCentered
        drag={{ containerWidth: true }}
        onDragEnd={onDragged}
      >
        {images.map((img, index) => (
          <div key={index} className="flex justify-center h-full basis-full shrink-0 grow snap-center">
            <img
              alt={`product-image-${index}`}
              aria-hidden={activeIndex !== index}
              className="object-contain w-auto h-full"
              src={resolveImageUrl(img)}
            />
          </div>
        ))}
      </SfScrollable>

      {/* Thumbnails */}
      <SfScrollable
        className="items-center w-full [&::-webkit-scrollbar]:hidden"
        activeIndex={activeIndex}
        buttonsPlacement="floating"
        slotPreviousButton={
          <SfButton
            className="absolute disabled:hidden !rounded-full z-10 left-4 bg-white"
            variant="secondary"
            size="sm"
            square
            slotPrefix={<SfIconChevronLeft size="sm" />}
          />
        }
        slotNextButton={
          <SfButton
            className="absolute disabled:hidden !rounded-full z-10 right-4 bg-white"
            variant="secondary"
            size="sm"
            square
            slotPrefix={<SfIconChevronRight size="sm" />}
          />
        }
      >
        {images.map((img, index) => (
          <button
            type="button"
            aria-label={`thumbnail-${index}`}
            aria-current={activeIndex === index}
            key={index}
            className={classNames(
              'md:w-14 md:h-auto relative shrink-0 pb-1 my-2 -mr-2 border-b-4 snap-start cursor-pointer transition-colors',
              activeIndex === index ? 'border-primary-700' : 'border-transparent'
            )}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => activeArrowNavigation(event, index)}
          >
            <img
              alt={`thumbnail-${index}`}
              className="object-cover border border-neutral-200 rounded-md"
              width="78"
              height="78"
              src={resolveImageUrl(img)}
            />
          </button>
        ))}
      </SfScrollable>
    </div>
  );
}

export default React.memo(ProductGallery);
