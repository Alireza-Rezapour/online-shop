"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** When this changes after an error, the preview tries again. */
  resetKey?: string;
}

/**
 * next/image throws for an unconfigured image host or a half-typed URL.
 * That must not take down the whole admin page while someone is typing.
 */
export class PreviewBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-40 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          پیش‌نمایش ساخته نشد. آدرس تصویر را بررسی کنید؛ دامنه‌ی تصویر باید در
          next.config تعریف شده باشد.
        </div>
      );
    }
    return this.props.children;
  }
}
