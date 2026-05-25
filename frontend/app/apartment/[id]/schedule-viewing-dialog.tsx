"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {CalendarIcon, Check, Clock} from "lucide-react"
import {format, isSameDay} from "date-fns"
import {cn} from "@/lib/utils"

import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Alert, AlertDescription} from "@/components/ui/alert"
import axios from "axios";
import {getAuth} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";

// Types
// type TimeSlot = {
//     value: string
//     label: string
// }
//
// type DateAvailability = {
//     date: Date
//     available: boolean
//     timeSlots: TimeSlot[]
// }

type ScheduleViewingDialogProps = {
    propertyId: string
}

type DateAvailability = {
    date: Date
    available: boolean
    timeSlots: {
        value: string
        label: string
    }[]
}

export function ScheduleViewingDialog({propertyId}: ScheduleViewingDialogProps) {
    const [date, setDate] = useState<Date>()
    const [time, setTime] = useState<string>()
    const [open, setOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [dateAvailability, setDateAvailability] = useState<DateAvailability[]>([]);

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;

    // const dateAvailability: DateAvailability[] = [
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth(), 14),
    //         available: true,
    //         timeSlots: [
    //             {value: "09:00", label: "9:00 AM"},
    //             {value: "10:00", label: "10:00 AM"},
    //             {value: "11:00", label: "11:00 AM"},
    //         ],
    //     },
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth(), 17),
    //         available: true,
    //         timeSlots: [
    //             {value: "13:00", label: "1:00 PM"},
    //             {value: "14:00", label: "2:00 PM"},
    //             {value: "15:00", label: "3:00 PM"},
    //         ],
    //     },
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
    //         available: true,
    //         timeSlots: [
    //             {value: "10:00", label: "10:00 AM"},
    //             {value: "11:00", label: "11:00 AM"},
    //             {value: "16:00", label: "4:00 PM"},
    //             {value: "17:00", label: "5:00 PM"},
    //         ],
    //     },
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    //         available: true,
    //         timeSlots: [
    //             {value: "09:00", label: "9:00 AM"},
    //             {value: "14:00", label: "2:00 PM"},
    //             {value: "15:00", label: "3:00 PM"},
    //         ],
    //     },
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth(), 21),
    //         available: true,
    //         timeSlots: [
    //             {value: "11:00", label: "11:00 AM"},
    //             {value: "13:00", label: "1:00 PM"},
    //         ],
    //     },
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2),
    //         available: true,
    //         timeSlots: [
    //             {value: "09:00", label: "9:00 AM"},
    //             {value: "10:00", label: "10:00 AM"},
    //             {value: "16:00", label: "4:00 PM"},
    //         ],
    //     },
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 3),
    //         available: true,
    //         timeSlots: [
    //             {value: "13:00", label: "1:00 PM"},
    //             {value: "14:00", label: "2:00 PM"},
    //             {value: "15:00", label: "3:00 PM"},
    //         ],
    //     },
    //     {
    //         date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 8),
    //         available: true,
    //         timeSlots: [
    //             {value: "10:00", label: "10:00 AM"},
    //             {value: "11:00", label: "11:00 AM"},
    //             {value: "12:00", label: "12:00 PM"},
    //         ],
    //     },
    // ]
    //
    // const unavailableDates = [
    //     new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    //     new Date(new Date().getFullYear(), new Date().getMonth(), 16),
    //     new Date(new Date().getFullYear(), new Date().getMonth(), 22),
    //     new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    //     new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5),
    //     new Date(new Date().getFullYear(), new Date().getMonth() + 1, 6),
    //     new Date(new Date().getFullYear(), new Date().getMonth() + 1, 7),
    // ]

    useEffect(() => {
        if (date) {
            setTime(undefined);
            const selectedDay = dateAvailability.find((d) => isSameDay(d.date, date));
            setAvailableTimeSlots(selectedDay?.timeSlots || []);
        } else {
            setAvailableTimeSlots([]);
        }
    }, [date, dateAvailability]);


    useEffect(() => {
        if (!open || !propertyId) return;

        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/availability`, {
                params: {propertyId}
            })
            .then(res => {
                const response = res.data;
                const mapped = response.map((entry: any) => ({
                    date: new Date(entry.date),
                    available: true,
                    timeSlots: entry.timeSlots,
                }));
                setDateAvailability(mapped);
            })
            .catch(err => {
                console.error("Failed to fetch availability:", err);
                setDateAvailability([]);
            });
    }, [open, propertyId]);

    const unavailableDates = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isNotAvailable = !dateAvailability.some((d) => isSameDay(d.date, date));
        return date < today || isNotAvailable;
    };


    const resetForm = () => {
        setDate(undefined)
        setTime(undefined)
        setSubmitted(false)
        setAvailableTimeSlots([])
    }

    const isDateAvailable = (date: Date) => {
        return dateAvailability.some((d) => isSameDay(d.date, date));
    };

    const disabledDates = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isAvailable = dateAvailability.some((d) => isSameDay(d.date, date));
        return date < today || !isAvailable;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!date || !time || !user) return

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/viewings`, {
                userId: user?.uid,
                propertyId: propertyId,
                date: format(date, "yyyy-MM-dd"),
                time: time
            })

            console.log("Scheduled viewing:", {date, time})
            setSubmitted(true)
        } catch (error) {
            console.error("Failed to schedule viewing:", error)
            alert("There was an error scheduling the viewing. Please try again.")
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen)
                if (!newOpen) resetForm()
            }}
        >
            <DialogTrigger asChild>
                <Button className="w-full">Schedule a Viewing</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {!submitted ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Schedule a Viewing</DialogTitle>
                            <DialogDescription>
                                Select your preferred date and time to view this property.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                {date ? format(date, "PPP") : "Select a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={(newDate) => {
                                                    setDate(newDate)
                                                    setCalendarOpen(false)
                                                }}
                                                autoFocus
                                                disabled={disabledDates}
                                                modifiers={{
                                                    unavailable: (d) =>
                                                        !dateAvailability.some((availableDate) => isSameDay(availableDate.date, d)),
                                                }}
                                                modifiersStyles={{
                                                    unavailable: {color: "#9CA3AF"},
                                                }}
                                            />
                                            <div className="p-3 border-t border-border">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Clock className="mr-1 h-3 w-3"/>
                                                    <span>White dates have available time slots</span>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="time">Time</Label>
                                    {date && availableTimeSlots.length > 0 ? (
                                        <Select onValueChange={setTime} value={time}>
                                            <SelectTrigger id="time">
                                                <SelectValue placeholder="Select a time"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTimeSlots.map((slot) => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : date ? (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertDescription>
                                                No time slots available for this date. Please select another date.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <Select disabled>
                                            <SelectTrigger id="time">
                                                <SelectValue placeholder="Select a date first"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="placeholder">Select a date first</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={!date || !time}>
                                        Schedule Viewing
                                    </Button>
                                </DialogFooter>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-green-100 p-3 rounded-full mb-4">
                            <Check className="h-6 w-6 text-green-600"/>
                        </div>
                        <DialogTitle className="mb-2">Viewing Scheduled!</DialogTitle>
                        <DialogDescription className="mb-6">
                            Your viewing has been scheduled for {date && format(date, "PPP")} at{" "}
                            {time && availableTimeSlots.find((slot) => slot.value === time)?.label}. We'll send a
                            confirmation to your email.
                        </DialogDescription>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
