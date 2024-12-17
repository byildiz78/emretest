import { useInView } from "@/hooks/use-inview";
import { memo } from 'react';
import WidgetCard from "./WidgetCard";
import { WebWidget } from "@/types/tables";

interface LazyWidgetCardProps extends WebWidget {
    loading: boolean;
    columnIndex: number;
}

const LazyWidgetCard = memo(function LazyWidgetCard({ loading, columnIndex, ...props }: LazyWidgetCardProps) {
    const [ref, isInView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });
    return (
      <div ref={ref}>
        {isInView ? (
          <WidgetCard {...props} loading={loading} columnIndex={columnIndex} />
        ) : (
          <div className="h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        )}
      </div>
    );
  })

export default LazyWidgetCard;
