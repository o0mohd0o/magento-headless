/**
 * register-defaults — wires the bundled element components into the registry.
 *
 * Imported for its side effect by MagezonRenderer. To OVERRIDE one with your own
 * design, call registerElement('type', MyComponent) from your app bootstrap after
 * this module loads. To ADD a type, create elements/MyType.tsx and add it here.
 */
import { registerElements } from './registry';

// --- Structure & core content (hand-authored reference components) ---
import { Row } from './elements/Row';
import { Column } from './elements/Column';
import { PassThrough } from './elements/PassThrough';
import { Heading } from './elements/Heading';
import { Text } from './elements/Text';
import { SingleImage } from './elements/SingleImage';
import { Button } from './elements/Button';

// --- Content & interactive elements ---
import { Separator } from './elements/Separator';
import { EmptySpace } from './elements/EmptySpace';
import { SocialIcons } from './elements/SocialIcons';
import { List } from './elements/List';
import { Gmaps } from './elements/Gmaps';
import { Tabs } from './elements/Tabs';
import { Countdown } from './elements/Countdown';
import { Icon } from './elements/Icon';
import { IconList } from './elements/IconList';
import { MessageBox } from './elements/MessageBox';
import { CallToAction } from './elements/CallToAction';
import { NumberCounter } from './elements/NumberCounter';
import { ProgressBar } from './elements/ProgressBar';
import { Video } from './elements/Video';
import { RawHtml } from './elements/RawHtml';
import { RawJs } from './elements/RawJs';
import { Accordion } from './elements/Accordion';
import { Toggle } from './elements/Toggle';
import { Slider } from './elements/Slider';
import { PricingTable } from './elements/PricingTable';
import { Testimonials } from './elements/Testimonials';
import { FlipBox } from './elements/FlipBox';

// --- Media galleries & sliders ---
import { ContentSlider } from './elements/ContentSlider';
import { ImageCarousel } from './elements/ImageCarousel';
import { ImageGallery } from './elements/ImageGallery';

// --- Social embeds ---
import { FacebookComments } from './elements/FacebookComments';
import { FacebookLike } from './elements/FacebookLike';
import { FacebookPage } from './elements/FacebookPage';
import { TwitterButton } from './elements/TwitterButton';
import { TwitterTimeline } from './elements/TwitterTimeline';
import { Instagram } from './elements/Instagram';
import { Flickr } from './elements/Flickr';
import { Pinterest } from './elements/Pinterest';

// --- Forms ---
import { SearchForm } from './elements/SearchForm';
import { ContactForm } from './elements/ContactForm';

// --- Magento-bridge elements ---
import { StaticBlock } from './elements/StaticBlock';
import { PageBuilderTemplate } from './elements/PageBuilderTemplate';
import { MagentoWidget } from './elements/MagentoWidget';
import { CustomBlock, Sidebar } from './elements/blocks';

// --- Commerce adapter (renders selection criteria; wire your product GraphQL) ---
import { CommerceElement, COMMERCE_TYPES } from './elements/commerce';

registerElements({
  // structure
  row: Row,
  inner_row: Row,
  column: Column,
  inner_column: Column,
  // container child types rendered by collection components
  tab: PassThrough,
  tab_item: PassThrough,
  accordion_section: PassThrough,
  // core content
  heading: Heading,
  text: Text,
  single_image: SingleImage,
  button: Button,
  // content & interactive
  separator: Separator,
  empty_space: EmptySpace,
  social_icons: SocialIcons,
  list: List,
  gmaps: Gmaps,
  tabs: Tabs,
  countdown: Countdown,
  icon: Icon,
  icon_list: IconList,
  message_box: MessageBox,
  call_to_action: CallToAction,
  number_counter: NumberCounter,
  progress_bar: ProgressBar,
  video: Video,
  raw_html: RawHtml,
  raw_js: RawJs,
  accordion: Accordion,
  toggle: Toggle,
  slider: Slider,
  pricing_table: PricingTable,
  testimonials: Testimonials,
  flip_box: FlipBox,
  // media galleries & sliders
  content_slider: ContentSlider,
  image_carousel: ImageCarousel,
  image_gallery: ImageGallery,
  // social embeds
  facebook_comments: FacebookComments,
  facebook_like: FacebookLike,
  facebook_page: FacebookPage,
  twitter_button: TwitterButton,
  twitter_timeline: TwitterTimeline,
  instagram: Instagram,
  flickr: Flickr,
  pinterest: Pinterest,
  // forms
  search_form: SearchForm,
  contact_form: ContactForm,
  // Magento bridges
  static_block: StaticBlock,
  pagebuilder_template: PageBuilderTemplate,
  magento_widget: MagentoWidget,
  magento_widgget: MagentoWidget, // tolerate Magezon's template typo
  custom_block: CustomBlock,
  sidebar: Sidebar,
});

// Commerce element types -> the adapter (override per type with registerElement).
registerElements(Object.fromEntries(COMMERCE_TYPES.map((t) => [t, CommerceElement])));
