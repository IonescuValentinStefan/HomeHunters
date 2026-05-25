"use client"

import {ChevronLeft, ChevronRight} from "lucide-react"
import Image from "next/image"
import {useState} from "react"

import {Button} from "@/components/ui/button"
import {Card} from "@/components/ui/card"

interface ImageCarouselProps {
    images: string[]
    title: string
}

export function ImageCarousel({images, title}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const goToPrevious = () => {
        const isFirstImage = currentIndex === 0
        const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1
        setCurrentIndex(newIndex)
    }

    const goToNext = () => {
        const isLastImage = currentIndex === images.length - 1
        const newIndex = isLastImage ? 0 : currentIndex + 1
        setCurrentIndex(newIndex)
    }

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex)
    }

    return (
        <div className="relative mb-8 w-full">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                    src={images[currentIndex] || "/property_default.jpg"}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    fill
                    className="object-cover transition-opacity duration-500"
                    priority
                />

                {/* Left and Right Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between p-4">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full opacity-70 shadow-lg transition-opacity hover:opacity-100"
                        onClick={goToPrevious}
                    >
                        <ChevronLeft className="h-6 w-6"/>
                        <span className="sr-only">Previous image</span>
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full opacity-70 shadow-lg transition-opacity hover:opacity-100"
                        onClick={goToNext}
                    >
                        <ChevronRight className="h-6 w-6"/>
                        <span className="sr-only">Next image</span>
                    </Button>
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                    <Card
                        key={index}
                        className={`m-2 relative h-16 w-24 cursor-pointer overflow-hidden transition-all ${
                            currentIndex === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => goToSlide(index)}
                    >
                        <Image src={image || "/img_6.png"} alt={`Thumbnail ${index + 1}`} fill
                               className="object-cover"/>
                    </Card>
                ))}
            </div>
        </div>
    )
}
