import type { TitleProps } from 'antd/es/typography/Title';
import type { ParagraphProps } from 'antd/es/typography/Paragraph';

export interface HProps extends TitleProps {
  className?: string;
}

export interface PProps extends ParagraphProps {
  className?: string;
}
