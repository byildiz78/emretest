import { useInView } from "@/hooks/use-inview";
import WidgetCard from "./MobileDashboardWidgetCard";
import { WebWidget } from "@/types/tables";

interface LazyWidgetCardProps extends WebWidget {
    loading: boolean;
    columnIndex: number;
}

const LazyWidgetCard = ({ loading, columnIndex, ...props }: LazyWidgetCardProps) => {
    const [ref, isInView] = useInView();
    return (
      <div ref={ref}>
        {isInView ? (
          <WidgetCard {...props} loading={loading} columnIndex={columnIndex} />
        ) : (
          <div className="h-[200px] bg-gray-100 rounded-xl animate-pulse" />
        )}
      </div>
    );
  }

export default LazyWidgetCard;
