"use client";
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

const FullCalendarWrapper = forwardRef((props, ref) => {
  const calendarRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getApi: () => calendarRef.current?.getApi()
  }));

  return (
    <FullCalendar 
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      {...props} 
    />
  );
});

FullCalendarWrapper.displayName = "FullCalendarWrapper";
export default FullCalendarWrapper;
