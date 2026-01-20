export const CLASSES = {
  card: "group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
  imageWrapper: "aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900",
  image:
    "w-full h-full object-cover group-hover:scale-105 transition-transform duration-200",
  placeholder: "w-full h-full flex items-center justify-center text-slate-400",
  content: "p-4",
  title:
    "text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
} as const;
