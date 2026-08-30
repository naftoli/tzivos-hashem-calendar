export interface DayRoutineItem {
  text: string;
  subCategory?: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface DayRoutine {
  dayOfWeek: string;
  hebrewDayName: string;
  title: string;
  items: DayRoutineItem[];
}

export const DAY_ROUTINES: Record<string, DayRoutine> = {
  Sunday: {
    dayOfWeek: 'Sunday',
    hebrewDayName: 'יום ראשון',
    title: "Sunday's Tasks",
    items: [
      {
        text: 'Receive the Niggun & Sicha for the Week',
        subCategory: 'Niggun of the Week',
      },
    ],
  },
  Monday: {
    dayOfWeek: 'Monday',
    hebrewDayName: 'יום שני',
    title: "Monday's Tasks",
    items: [
      {
        text: 'Mark Missions from the previous week',
        action: {
          label: 'Mark Missions',
          url: 'https://mashpia.com/new/missions/mark',
        },
      },
    ],
  },
  Tuesday: {
    dayOfWeek: 'Tuesday',
    hebrewDayName: 'יום שלישי',
    title: "Tuesday's Tasks",
    items: [
      {
        text: 'Print Missions For the coming Week',
        action: {
          label: 'Print Missions',
          url: 'https://mashpia.com/new/missions/print',
        },
      },
    ],
  },
  Wednesday: {
    dayOfWeek: 'Wednesday',
    hebrewDayName: 'יום רביעי',
    title: "Wednesday's Tasks",
    items: [
      {
        text: 'Data Entry Due Date',
        subCategory: 'Shabbos Mevorchim Data Due',
      },
      {
        text: 'Send out a Whatsapp PSA for the 5M Raffle.',
        subCategory: '5M Raffle Mission Start',
      },
    ],
  },
  Thursday: {
    dayOfWeek: 'Thursday',
    hebrewDayName: 'יום חמישי',
    title: "Thursday's Tasks",
    items: [
      {
        text: 'Weekly Raffle Winners Announced',
        subCategory: '5M Winners Announced',
      },
      {
        text: 'Print and Hang 5M Winners Report',
        action: {
          label: 'Report',
          url: 'https://mashpia.com/raffles/posters/weekly.php',
        },
        subCategory: '5M Winners Announced',
      },
    ],
  },
  Friday: {
    dayOfWeek: 'Friday',
    hebrewDayName: 'ערב שבת קודש',
    title: "Friday's Tasks",
    items: [
      {
        text: 'Collect Missions from the previous week.',
      },
      {
        text: 'Hand out Missions and Hachayol',
        subCategory: 'Hachayol Magazines',
      },
    ],
  },
};

export function getDayRoutine(
  dayOfWeek: string,
  selectedSubCategories?: Record<string, boolean>
): DayRoutine | undefined {
  if (dayOfWeek === 'Shabbos') return undefined;

  const routine = DAY_ROUTINES[dayOfWeek];
  if (!routine) return undefined;

  // Filter task items against active subcategory toggle state
  if (selectedSubCategories) {
    const filteredItems = routine.items.filter((item) => {
      // If task belongs to a subcategory that is explicitly set to false, hide it
      if (item.subCategory && selectedSubCategories[item.subCategory] === false) {
        return false;
      }
      return true;
    });

    if (filteredItems.length === 0) return undefined;

    return {
      ...routine,
      items: filteredItems,
    };
  }

  return routine;
}