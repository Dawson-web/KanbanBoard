import { useRef, useState, useEffect } from "react";

const useScrollDragble = (tagName) => {
  const contentRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (
        contentRef.current &&
        e.target.tagName == tagName && // 此处判断是否是主内容区域,避免拖拽冲突
        !e.target.closest(".ant-btn") &&
        !e.target.closest(".ant-modal")
      ) {
        setIsDragging(true);
        setStartX(e.pageX - contentRef.current.offsetLeft);
        setScrollLeft(contentRef.current.scrollLeft);
        contentRef.current.style.cursor = "grabbing";
        contentRef.current.style.userSelect = "none";
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      if (contentRef.current) {
        const x = e.pageX - contentRef.current.offsetLeft;
        const walk = (x - startX) * 2; // 滚动速度倍数
        contentRef.current.scrollLeft = scrollLeft - walk;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (contentRef.current) {
        contentRef.current.style.cursor = "default";
        contentRef.current.style.userSelect = "auto";
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mouseleave", handleMouseUp);
    }

    return () => {
      if (content) {
        content.removeEventListener("mousedown", handleMouseDown);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  return contentRef;
};

export default useScrollDragble;
