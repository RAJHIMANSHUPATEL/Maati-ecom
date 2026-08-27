import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const SubCategories = ({ categories }) => {
  const baseUrl = import.meta.env.VITE_IMAGE_URL;

  return (
    <div className="space-y-8 container lg:px-10">
      {categories
        .filter((cat) => cat.subcategories && cat.subcategories.length > 0)
        .map((cat) => (
          <div key={cat._id}>
            {/* Category Heading */}
            <h2 className="text-xl font-bold mb-4">{cat.name}</h2>

            {/* Subcategories Slider */}
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {cat.subcategories.map((sub) => (
                <SwiperSlide key={sub._id}>
                  <div className="relative flex flex-col items-center group">
                    <a
                      href="#"
                      aria-label={sub.name}
                      className="absolute inset-0 z-10"
                    />
                    <img
                      src={`${baseUrl}${sub.cover}`}
                      alt={sub.name}
                      className="w-40 h-40 object-cover rounded-full bg-neutral-100 group-hover:shadow-xl"
                    />
                    <p className="mt-3 font-semibold text-center group-hover:underline">
                      {sub.name}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}
    </div>
  );
};

export default SubCategories;
