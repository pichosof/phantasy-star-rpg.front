# phantasy-star-rpg.front

## Current Branch Notes

- Migration progress and PR breakdown live in `MIGRATION_PLAN.md`.
- The frontend can be reached on `localhost` and on the local network for
  mobile QA. Current example: `http://192.168.10.198:3000`.
- Mobile shell work is in progress with `antd-mobile` for screens below
  `768px`, including header, menu, settings, PWA and GM flows.
- GM-only routes now redirect to `/403` when there is no active GM key:
  `/lores`, `/gm/notes`, `/gm/images` and `/gm/sheets`.
- Useful commands:
  - `yarn start`
  - `yarn type-check`
  - `yarn lint`
  - `yarn build`

```
phantasy-star-rpg.front
├─ .eslintrc.js
├─ .husky
│  ├─ pre-commit
│  └─ _
│     └─ husky.sh
├─ .prettierrc.js
├─ .stylelintrc
├─ .yarnrc.yml
├─ CODE_OF_CONDUCT.md
├─ CONTRIBUTING.md
├─ craco.config.js
├─ LICENSE
├─ package.json
├─ patches
│  └─ react-trello+2.2.11.patch
├─ public
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ Lightence-screenshot.png
│  ├─ logo192.png
│  ├─ logo512.png
│  ├─ manifest.json
│  ├─ robots.txt
│  ├─ spinners
│  │  └─ spinner.svg
│  └─ themes
│     └─ main.css
├─ README.md
├─ SECURITY.md
├─ src
│  ├─ @types
│  │  ├─ beforeinstallpromptevent.d.ts
│  │  ├─ credit-cards.d.ts
│  │  ├─ react-app-env.d.ts
│  │  └─ trello.d.ts
│  ├─ api
│  │  ├─ activity.api.ts
│  │  ├─ ApiError.ts
│  │  ├─ auth.api.ts
│  │  ├─ calendar.api.ts
│  │  ├─ covid.api.ts
│  │  ├─ doctors.api.ts
│  │  ├─ earnings.api.ts
│  │  ├─ http.api.ts
│  │  ├─ mocks
│  │  │  ├─ auth.api.mock.ts
│  │  │  └─ http.api.mock.ts
│  │  ├─ news.api.ts
│  │  ├─ nftDashboard.api.ts
│  │  ├─ notifications.api.ts
│  │  ├─ paymentHistory.api.ts
│  │  ├─ screenings.api.ts
│  │  ├─ statistics.api.ts
│  │  ├─ table.api.ts
│  │  └─ trendingCreators.ts
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ icons
│  │  │  ├─ arrow-down.svg
│  │  │  ├─ bones.svg
│  │  │  ├─ btc.svg
│  │  │  ├─ eth.svg
│  │  │  ├─ facebook.svg
│  │  │  ├─ fat.svg
│  │  │  ├─ google.svg
│  │  │  ├─ map-background.svg
│  │  │  ├─ marker-doctor.svg
│  │  │  ├─ marker-polyclinic.svg
│  │  │  ├─ nft-icon.svg
│  │  │  ├─ pigeon.svg
│  │  │  ├─ protein.svg
│  │  │  └─ water.svg
│  │  ├─ images
│  │  │  ├─ error404.svg
│  │  │  ├─ login-bg.webp
│  │  │  ├─ new-lane.webp
│  │  │  ├─ nothing-found.webp
│  │  │  ├─ server-error.svg
│  │  │  ├─ stub-avatar.webp
│  │  │  └─ verify-email.webp
│  │  ├─ logo-dark.png
│  │  ├─ logo.png
│  │  └─ map-data
│  │     └─ countries.geo.json
│  ├─ components
│  │  ├─ apps
│  │  │  ├─ kanban
│  │  │  │  ├─ AddCardLink
│  │  │  │  │  ├─ AddCardLink.styles.ts
│  │  │  │  │  └─ AddCardLink.tsx
│  │  │  │  ├─ Card
│  │  │  │  │  ├─ Card.styles.ts
│  │  │  │  │  └─ Card.tsx
│  │  │  │  ├─ interfaces.ts
│  │  │  │  ├─ Kanban
│  │  │  │  │  ├─ Kanban.styles.ts
│  │  │  │  │  └─ Kanban.tsx
│  │  │  │  ├─ LaneHeader
│  │  │  │  │  ├─ LaneHeader.styles.ts
│  │  │  │  │  └─ LaneHeader.tsx
│  │  │  │  ├─ newCardForm
│  │  │  │  │  ├─ NewCardForm
│  │  │  │  │  │  ├─ NewCardForm.styles.ts
│  │  │  │  │  │  └─ NewCardForm.tsx
│  │  │  │  │  ├─ ParticipantsDropdown
│  │  │  │  │  │  ├─ ParticipantsDropdown.styles.ts
│  │  │  │  │  │  └─ ParticipantsDropdown.tsx
│  │  │  │  │  └─ TagDropdown
│  │  │  │  │     ├─ TagDropdown.styles.ts
│  │  │  │  │     └─ TagDropdown.tsx
│  │  │  │  ├─ NewLaneForm
│  │  │  │  │  ├─ NewLaneForm.styles.ts
│  │  │  │  │  └─ NewLaneForm.tsx
│  │  │  │  └─ NewLaneSection
│  │  │  │     ├─ NewLaneSection.styles.ts
│  │  │  │     └─ NewLaneSection.tsx
│  │  │  └─ newsFeed
│  │  │     ├─ NewsFeed.tsx
│  │  │     ├─ NewsFilter
│  │  │     │  ├─ NewsFilter.styles.ts
│  │  │     │  └─ NewsFilter.tsx
│  │  │     └─ Validator.ts
│  │  ├─ auth
│  │  │  ├─ ForgotPasswordForm
│  │  │  │  ├─ ForgotPasswordForm.styles.ts
│  │  │  │  └─ ForgotPasswordForm.tsx
│  │  │  ├─ LockForm
│  │  │  │  ├─ LockForm.styles.ts
│  │  │  │  └─ LockForm.tsx
│  │  │  ├─ LoginForm
│  │  │  │  ├─ LoginForm.styles.ts
│  │  │  │  └─ LoginForm.tsx
│  │  │  ├─ NewPasswordForm
│  │  │  │  ├─ NewPasswordForm.styles.ts
│  │  │  │  └─ NewPasswordForm.tsx
│  │  │  ├─ SecurityCodeForm
│  │  │  │  ├─ SecurityCodeForm.styles.ts
│  │  │  │  └─ SecurityCodeForm.tsx
│  │  │  └─ SignUpForm
│  │  │     ├─ SignUpForm.styles.tsx
│  │  │     └─ SignUpForm.tsx
│  │  ├─ charts
│  │  │  ├─ BarAnimationDelayChart
│  │  │  │  └─ BarAnimationDelayChart.tsx
│  │  │  ├─ GradientStackedAreaChart
│  │  │  │  └─ GradientStackedAreaChart.tsx
│  │  │  ├─ LineRaceChart
│  │  │  │  ├─ data.json
│  │  │  │  └─ LineRaceChart.tsx
│  │  │  ├─ ScatterChart
│  │  │  │  └─ ScatterChart.tsx
│  │  │  └─ VisitorsPieChart.tsx
│  │  ├─ common
│  │  │  ├─ Alert
│  │  │  │  ├─ Alert.styles.ts
│  │  │  │  └─ Alert.tsx
│  │  │  ├─ ArticleCard
│  │  │  │  ├─ ArticleCard.styles.ts
│  │  │  │  └─ ArticleCard.tsx
│  │  │  ├─ AutoComplete
│  │  │  │  ├─ AutoComplete.styles.ts
│  │  │  │  └─ AutoComplete.tsx
│  │  │  ├─ Avatar
│  │  │  │  ├─ Avatar.styles.ts
│  │  │  │  └─ Avatar.tsx
│  │  │  ├─ Badge
│  │  │  │  ├─ Badge.styles.ts
│  │  │  │  └─ Badge.tsx
│  │  │  ├─ Breadcrumb
│  │  │  │  ├─ Breadcrumb.styles.ts
│  │  │  │  └─ Breadcrumb.tsx
│  │  │  ├─ Burger
│  │  │  │  └─ BurgerIcon.tsx
│  │  │  ├─ buttons
│  │  │  │  └─ Button
│  │  │  │     ├─ Button.styles.ts
│  │  │  │     └─ Button.tsx
│  │  │  ├─ CalendarSwitch
│  │  │  │  ├─ CalendarSwitch.styles.ts
│  │  │  │  └─ CalendarSwitch.tsx
│  │  │  ├─ Card
│  │  │  │  ├─ Card.styles.ts
│  │  │  │  └─ Card.tsx
│  │  │  ├─ Carousel
│  │  │  │  └─ Carousel.tsx
│  │  │  ├─ CarouselArrow
│  │  │  │  ├─ CarouselArrow.styles.ts
│  │  │  │  └─ CarouselArrow.tsx
│  │  │  ├─ charts
│  │  │  │  ├─ BaseChart.tsx
│  │  │  │  ├─ Legend
│  │  │  │  │  ├─ Legend.styles.ts
│  │  │  │  │  └─ Legend.tsx
│  │  │  │  ├─ PieChart.tsx
│  │  │  │  └─ PieChartCustomLegend.tsx
│  │  │  ├─ Checkbox
│  │  │  │  ├─ Checkbox.styles.ts
│  │  │  │  └─ Checkbox.tsx
│  │  │  ├─ Collapse
│  │  │  │  ├─ Collapse.styles.ts
│  │  │  │  └─ Collapse.tsx
│  │  │  ├─ CountryMap
│  │  │  │  ├─ CountryMap.styles.ts
│  │  │  │  └─ CountryMap.tsx
│  │  │  ├─ DoctorProfile
│  │  │  │  ├─ DoctorProfile.styles.ts
│  │  │  │  └─ DoctorProfile.tsx
│  │  │  ├─ Dropdown
│  │  │  │  ├─ Dropdown.styles.ts
│  │  │  │  └─ Dropdown.tsx
│  │  │  ├─ Feed
│  │  │  │  ├─ Feed.styles.ts
│  │  │  │  └─ Feed.tsx
│  │  │  ├─ forms
│  │  │  │  ├─ BaseButtonsForm
│  │  │  │  │  └─ BaseButtonsForm.tsx
│  │  │  │  ├─ BaseForm
│  │  │  │  │  └─ BaseForm.tsx
│  │  │  │  └─ components
│  │  │  │     ├─ BaseButtonsGroup
│  │  │  │     │  ├─ BaseButtonsGroup.styles.ts
│  │  │  │     │  └─ BaseButtonsGroup.tsx
│  │  │  │     ├─ BaseFormItem
│  │  │  │     │  └─ BaseFormItem.ts
│  │  │  │     ├─ BaseFormList
│  │  │  │     │  └─ BaseFormList.ts
│  │  │  │     └─ BaseFormTitle
│  │  │  │        └─ BaseFormTitle.ts
│  │  │  ├─ GlobalSpinner.tsx
│  │  │  ├─ icons
│  │  │  │  ├─ FacebookIcon.tsx
│  │  │  │  ├─ FilterIcon.tsx
│  │  │  │  ├─ LinkedinIcon.tsx
│  │  │  │  ├─ MoonIcon.tsx
│  │  │  │  └─ SunIcon.tsx
│  │  │  ├─ inputs
│  │  │  │  ├─ ClipboardInput
│  │  │  │  │  └─ ClipboardInput.tsx
│  │  │  │  ├─ Input
│  │  │  │  │  ├─ Input.styles.ts
│  │  │  │  │  └─ Input.tsx
│  │  │  │  ├─ InputNumber
│  │  │  │  │  ├─ InputNumber.styles.ts
│  │  │  │  │  └─ InputNumber.tsx
│  │  │  │  ├─ InputPassword
│  │  │  │  │  ├─ InputPassword.styles.ts
│  │  │  │  │  └─ InputPassword.tsx
│  │  │  │  ├─ OpenURLInput
│  │  │  │  │  └─ OpenURLInput.tsx
│  │  │  │  ├─ SearchInput
│  │  │  │  │  ├─ SearchInput.styles.ts
│  │  │  │  │  └─ SearchInput.tsx
│  │  │  │  └─ SuffixInput
│  │  │  │     ├─ SuffixInput.styles.ts
│  │  │  │     └─ SuffixInput.tsx
│  │  │  ├─ Loading.tsx
│  │  │  ├─ Menu
│  │  │  │  ├─ Menu.styles.ts
│  │  │  │  └─ Menu.tsx
│  │  │  ├─ Modal
│  │  │  │  ├─ Modal.styles.ts
│  │  │  │  └─ Modal.tsx
│  │  │  ├─ MoonSunSwitch
│  │  │  │  ├─ MoonSunSwitch.styles.ts
│  │  │  │  └─ MoonSunSwitch.tsx
│  │  │  ├─ NotFound
│  │  │  │  ├─ NotFound.styles.ts
│  │  │  │  └─ NotFound.tsx
│  │  │  ├─ Notification
│  │  │  │  ├─ Notification.styles.ts
│  │  │  │  └─ Notification.tsx
│  │  │  ├─ Overlay.tsx
│  │  │  ├─ PageTitle
│  │  │  │  └─ PageTitle.tsx
│  │  │  ├─ Pagination
│  │  │  │  ├─ Pagination.styles.ts
│  │  │  │  └─ Pagination.tsx
│  │  │  ├─ pickers
│  │  │  │  ├─ DatePicker.tsx
│  │  │  │  ├─ DayjsDatePicker.tsx
│  │  │  │  └─ TimeRangePicker.tsx
│  │  │  ├─ Popconfirm
│  │  │  │  ├─ Popconfirm.styles.ts
│  │  │  │  └─ Popconfirm.tsx
│  │  │  ├─ Popover
│  │  │  │  ├─ Popover.styles.ts
│  │  │  │  └─ Popover.tsx
│  │  │  ├─ Progress
│  │  │  │  ├─ Progress.styles.ts
│  │  │  │  └─ Progress.tsx
│  │  │  ├─ Radio
│  │  │  │  ├─ Radio.styles.ts
│  │  │  │  └─ Radio.tsx
│  │  │  ├─ Rate
│  │  │  │  ├─ Rate.styles.ts
│  │  │  │  └─ Rate.tsx
│  │  │  ├─ References
│  │  │  │  ├─ References.styles.ts
│  │  │  │  └─ References.tsx
│  │  │  ├─ RequireFullscreen
│  │  │  │  └─ RequireFullscreen.tsx
│  │  │  ├─ Result
│  │  │  │  ├─ Result.styles.ts
│  │  │  │  └─ Result.tsx
│  │  │  ├─ selects
│  │  │  │  ├─ MonthSelect
│  │  │  │  │  └─ MonthSelect.tsx
│  │  │  │  ├─ Select
│  │  │  │  │  ├─ Select.styles.ts
│  │  │  │  │  └─ Select.tsx
│  │  │  │  └─ StatisticsSelect
│  │  │  │     └─ StatisticsSelect.tsx
│  │  │  ├─ Skeleton
│  │  │  │  ├─ Skeleton.styles.ts
│  │  │  │  └─ Skeleton.tsx
│  │  │  ├─ Slider
│  │  │  │  ├─ Slider.styles.ts
│  │  │  │  └─ Slider.tsx
│  │  │  ├─ Spinner
│  │  │  │  ├─ Spinner.styles.ts
│  │  │  │  └─ Spinner.tsx
│  │  │  ├─ Steps
│  │  │  │  ├─ Steps.styles.ts
│  │  │  │  └─ Steps.tsx
│  │  │  ├─ Switch
│  │  │  │  ├─ Switch.styles.ts
│  │  │  │  └─ Switch.tsx
│  │  │  ├─ Table
│  │  │  │  ├─ Table.less
│  │  │  │  ├─ Table.styles.ts
│  │  │  │  └─ Table.tsx
│  │  │  ├─ Tabs
│  │  │  │  ├─ Tabs.styles.ts
│  │  │  │  └─ Tabs.tsx
│  │  │  ├─ Tag
│  │  │  │  ├─ Tag.styles.ts
│  │  │  │  └─ Tag.tsx
│  │  │  ├─ typography
│  │  │  │  ├─ H1
│  │  │  │  │  ├─ H1.styles.ts
│  │  │  │  │  └─ H1.tsx
│  │  │  │  ├─ H2
│  │  │  │  │  ├─ H2.styles.ts
│  │  │  │  │  └─ H2.tsx
│  │  │  │  ├─ H3
│  │  │  │  │  ├─ H3.styles.ts
│  │  │  │  │  └─ H3.tsx
│  │  │  │  ├─ H4
│  │  │  │  │  ├─ H4.styles.ts
│  │  │  │  │  └─ H4.tsx
│  │  │  │  ├─ H5
│  │  │  │  │  ├─ H5.styles.ts
│  │  │  │  │  └─ H5.tsx
│  │  │  │  ├─ H6
│  │  │  │  │  ├─ H6.styles.ts
│  │  │  │  │  └─ H6.tsx
│  │  │  │  ├─ interfaces.ts
│  │  │  │  ├─ P1
│  │  │  │  │  ├─ P1.styles.ts
│  │  │  │  │  └─ P1.tsx
│  │  │  │  └─ P2
│  │  │  │     ├─ P2.styles.ts
│  │  │  │     └─ P2.tsx
│  │  │  ├─ Upload
│  │  │  │  ├─ Upload.styles.ts
│  │  │  │  └─ Upload.tsx
│  │  │  └─ VerificationCodeInput
│  │  │     ├─ VerificationCodeInput.styles.ts
│  │  │     └─ VerificationCodeInput.tsx
│  │  ├─ Error
│  │  │  ├─ Error.styles.ts
│  │  │  └─ Error.tsx
│  │  ├─ forms
│  │  │  ├─ ControlForm
│  │  │  │  ├─ AddUserFormModal.tsx
│  │  │  │  ├─ ControlForm.styles.ts
│  │  │  │  ├─ ControlForm.tsx
│  │  │  │  └─ useResetFormOnCloseModal.ts
│  │  │  ├─ DynamicForm
│  │  │  │  ├─ DynamicForm.styles.ts
│  │  │  │  └─ DynamicForm.tsx
│  │  │  ├─ InputCode
│  │  │  │  └─ InputCode.tsx
│  │  │  ├─ StepForm
│  │  │  │  ├─ StepForm.styles.ts
│  │  │  │  ├─ StepForm.tsx
│  │  │  │  └─ Steps
│  │  │  │     ├─ Step1.tsx
│  │  │  │     ├─ Step2.tsx
│  │  │  │     ├─ Step3.tsx
│  │  │  │     └─ Step4.tsx
│  │  │  └─ ValidationForm
│  │  │     └─ ValidationForm.tsx
│  │  ├─ header
│  │  │  ├─ components
│  │  │  │  ├─ GithubButton
│  │  │  │  │  └─ GitHubButton.tsx
│  │  │  │  ├─ HeaderFullscreen
│  │  │  │  │  └─ HeaderFullscreen.tsx
│  │  │  │  ├─ HeaderSearch
│  │  │  │  │  ├─ HeaderSearch.styles.ts
│  │  │  │  │  └─ HeaderSearch.tsx
│  │  │  │  ├─ notificationsDropdown
│  │  │  │  │  ├─ NotificationsDropdown.tsx
│  │  │  │  │  └─ NotificationsOverlay
│  │  │  │  │     ├─ NotificationsOverlay.styles.ts
│  │  │  │  │     └─ NotificationsOverlay.tsx
│  │  │  │  ├─ profileDropdown
│  │  │  │  │  ├─ ProfileDropdown
│  │  │  │  │  │  ├─ ProfileDropdown.styles.ts
│  │  │  │  │  │  └─ ProfileDropdown.tsx
│  │  │  │  │  └─ ProfileOverlay
│  │  │  │  │     ├─ ProfileOverlay.styles.ts
│  │  │  │  │     └─ ProfileOverlay.tsx
│  │  │  │  ├─ searchDropdown
│  │  │  │  │  ├─ SearchDropdown.tsx
│  │  │  │  │  └─ searchOverlay
│  │  │  │  │     ├─ SearchFilter
│  │  │  │  │     │  ├─ SearchFilter.styles.ts
│  │  │  │  │     │  └─ SearchFilter.tsx
│  │  │  │  │     ├─ SearchOverlay
│  │  │  │  │     │  ├─ SearchOverlay.styles.ts
│  │  │  │  │     │  └─ SearchOverlay.tsx
│  │  │  │  │     └─ SearchResults
│  │  │  │  │        ├─ SearchResults.styles.ts
│  │  │  │  │        └─ SearchResults.tsx
│  │  │  │  └─ settingsDropdown
│  │  │  │     ├─ SettingsDropdown.tsx
│  │  │  │     └─ settingsOverlay
│  │  │  │        ├─ LanguagePicker
│  │  │  │        │  └─ LanguagePicker.tsx
│  │  │  │        ├─ nightModeSettings
│  │  │  │        │  ├─ NightModeSettings.tsx
│  │  │  │        │  └─ NightTimePicker
│  │  │  │        │     ├─ NightTimePicker.styles.ts
│  │  │  │        │     └─ NightTimePicker.tsx
│  │  │  │        ├─ SettingsOverlay
│  │  │  │        │  ├─ SettingsOverlay.styles.ts
│  │  │  │        │  └─ SettingsOverlay.tsx
│  │  │  │        └─ ThemePicker
│  │  │  │           └─ ThemePicker.tsx
│  │  │  ├─ Header.styles.ts
│  │  │  └─ Header.tsx
│  │  ├─ medical-dashboard
│  │  │  ├─ activityCard
│  │  │  │  ├─ ActivityCard.tsx
│  │  │  │  └─ ActivityChart.tsx
│  │  │  ├─ bloodScreeningCard
│  │  │  │  ├─ BloodScreeningCard
│  │  │  │  │  ├─ BloodScreeningCard.styles.ts
│  │  │  │  │  └─ BloodScreeningCard.tsx
│  │  │  │  ├─ BloodScreeningChart
│  │  │  │  │  └─ BloodScreeningChart.tsx
│  │  │  │  └─ BloodScreeningTable
│  │  │  │     ├─ BloodScreeningTable.styles.ts
│  │  │  │     └─ BloodScreeningTable.tsx
│  │  │  ├─ covidCard
│  │  │  │  ├─ CovidCard.tsx
│  │  │  │  └─ CovidChart.tsx
│  │  │  ├─ DashboardCard
│  │  │  │  └─ DashboardCard.tsx
│  │  │  ├─ favoriteDoctors
│  │  │  │  ├─ DoctorCard
│  │  │  │  │  ├─ DoctorCard.styles.ts
│  │  │  │  │  └─ DoctorCard.tsx
│  │  │  │  └─ FavoriteDoctorsCard
│  │  │  │     ├─ FavoritesDoctorsCard.styles.ts
│  │  │  │     └─ FavoritesDoctorsCard.tsx
│  │  │  ├─ HealthCard
│  │  │  │  └─ HealthCard.tsx
│  │  │  ├─ mapCard
│  │  │  │  ├─ DoctorsMap
│  │  │  │  │  ├─ DoctorsMap.styles.ts
│  │  │  │  │  └─ DoctorsMap.tsx
│  │  │  │  └─ MapCard.tsx
│  │  │  ├─ NewsCard
│  │  │  │  ├─ NewsCard.styles.ts
│  │  │  │  └─ NewsCard.tsx
│  │  │  ├─ PatientResultsCard
│  │  │  │  ├─ PatientResultsCard.styles.ts
│  │  │  │  └─ PatientResultsCard.tsx
│  │  │  ├─ screeningsCard
│  │  │  │  ├─ ScreeningsCard
│  │  │  │  │  ├─ ScreeningsCard.styles.ts
│  │  │  │  │  └─ ScreeningsCard.tsx
│  │  │  │  ├─ ScreeningsChart
│  │  │  │  │  └─ ScreeningsChart.tsx
│  │  │  │  ├─ screeningsFriends
│  │  │  │  │  ├─ DesktopScreenings
│  │  │  │  │  │  ├─ DesktopScreenings.styles.ts
│  │  │  │  │  │  └─ DesktopScreenings.tsx
│  │  │  │  │  ├─ interfaces.ts
│  │  │  │  │  ├─ MobileScreenings
│  │  │  │  │  │  ├─ MobileScreenings.styles.ts
│  │  │  │  │  │  └─ MobileScreenings.tsx
│  │  │  │  │  ├─ ScreeningsFriend
│  │  │  │  │  │  ├─ ScreeningsFriend.styles.ts
│  │  │  │  │  │  └─ ScreeningsFriend.tsx
│  │  │  │  │  └─ ScreeningsFriends
│  │  │  │  │     ├─ ScreeningsFriends.styles.ts
│  │  │  │  │     └─ ScreeningsFriends.tsx
│  │  │  │  └─ ScreeningsHeader
│  │  │  │     └─ ScreeningsHeader.tsx
│  │  │  ├─ statisticsCards
│  │  │  │  ├─ statisticsCard
│  │  │  │  │  ├─ StatisticsCard
│  │  │  │  │  │  ├─ StatisticsCard.styles.ts
│  │  │  │  │  │  └─ StatisticsCard.tsx
│  │  │  │  │  ├─ StatisticsInfo
│  │  │  │  │  │  ├─ StatisticsInfo.styles.ts
│  │  │  │  │  │  └─ StatisticsInfo.tsx
│  │  │  │  │  └─ StatisticsProgress
│  │  │  │  │     ├─ StatisticsProgress.styles.ts
│  │  │  │  │     └─ StatisticsProgress.tsx
│  │  │  │  └─ StatisticsCards.tsx
│  │  │  └─ treatmentCard
│  │  │     ├─ TreatmentCalendar
│  │  │     │  ├─ TreatmentCalendar.styles.ts
│  │  │     │  └─ TreatmentCalendar.tsx
│  │  │     ├─ TreatmentCard.tsx
│  │  │     ├─ TreatmentDoctor
│  │  │     │  ├─ TreatmentDoctor.styles.ts
│  │  │     │  └─ TreatmentDoctor.tsx
│  │  │     ├─ TreatmentNotFound
│  │  │     │  ├─ TreatmentNotFound.styles.ts
│  │  │     │  └─ TreatmentNotFound.tsx
│  │  │     └─ TreatmentPanel.tsx
│  │  ├─ nft-dashboard
│  │  │  ├─ activityStory
│  │  │  │  ├─ ActivityStory.styles.ts
│  │  │  │  ├─ ActivityStory.tsx
│  │  │  │  └─ ActivityStoryItem
│  │  │  │     ├─ ActivityStoryItem.styles.ts
│  │  │  │     └─ ActivityStoryItem.tsx
│  │  │  ├─ Balance
│  │  │  │  ├─ Balance.styles.ts
│  │  │  │  └─ Balance.tsx
│  │  │  ├─ common
│  │  │  │  ├─ NFTCard
│  │  │  │  │  ├─ NFTCard.styles.ts
│  │  │  │  │  └─ NFTCard.tsx
│  │  │  │  ├─ NFTCardHeader
│  │  │  │  │  ├─ NFTCardHeader.styles.ts
│  │  │  │  │  └─ NFTCardHeader.tsx
│  │  │  │  └─ ViewAll
│  │  │  │     ├─ ViewAll.styles.ts
│  │  │  │     └─ ViewAll.tsx
│  │  │  ├─ recentActivity
│  │  │  │  ├─ RecentActivity.styles.ts
│  │  │  │  ├─ RecentActivity.tsx
│  │  │  │  ├─ recentActivityFeed
│  │  │  │  │  ├─ RecentActivityFeed.styles.ts
│  │  │  │  │  ├─ RecentActivityFeed.tsx
│  │  │  │  │  └─ RecentActivityItem
│  │  │  │  │     ├─ RecentActivityItem.styles.ts
│  │  │  │  │     └─ RecentActivityItem.tsx
│  │  │  │  ├─ recentActivityFilters
│  │  │  │  │  ├─ RecentActivityFilter.styles.ts
│  │  │  │  │  ├─ RecentActivityFilter.tsx
│  │  │  │  │  └─ RecentActivityStatusFilter
│  │  │  │  │     ├─ RecentActivityStatusFilter.styles.ts
│  │  │  │  │     └─ RecentActivityStatusFilter.tsx
│  │  │  │  └─ RecentActivityHeader
│  │  │  │     └─ RecentActivityHeader.tsx
│  │  │  ├─ recently-added
│  │  │  │  ├─ nft-card
│  │  │  │  │  ├─ NftCard.styles.ts
│  │  │  │  │  └─ NftCard.tsx
│  │  │  │  ├─ RecentlyAddedNft.styles.ts
│  │  │  │  └─ RecentlyAddedNft.tsx
│  │  │  ├─ totalEarning
│  │  │  │  ├─ TotalEarning.styles.ts
│  │  │  │  ├─ TotalEarning.tsx
│  │  │  │  └─ TotalEarningChart
│  │  │  │     └─ TotalEarningChart.tsx
│  │  │  ├─ trending-collections
│  │  │  │  ├─ collection
│  │  │  │  │  ├─ TrendingCollection.styles.ts
│  │  │  │  │  └─ TrendingCollection.tsx
│  │  │  │  ├─ TrendingCollections.styles.ts
│  │  │  │  └─ TrendingCollections.tsx
│  │  │  └─ trending-creators
│  │  │     ├─ story
│  │  │     │  ├─ TrendingCreatorsStory.styles.ts
│  │  │     │  └─ TrendingCreatorsStory.tsx
│  │  │     ├─ TrendingCreators.styles.ts
│  │  │     └─ TrendingCreators.tsx
│  │  ├─ profile
│  │  │  └─ profileCard
│  │  │     ├─ profileFormNav
│  │  │     │  ├─ nav
│  │  │     │  │  ├─ notifications
│  │  │     │  │  │  ├─ CheckboxColumn
│  │  │     │  │  │  │  ├─ CheckboxColumn.styles.ts
│  │  │     │  │  │  │  └─ CheckboxColumn.tsx
│  │  │     │  │  │  ├─ interfaces.ts
│  │  │     │  │  │  ├─ Notifications
│  │  │     │  │  │  │  ├─ Notifications.styles.ts
│  │  │     │  │  │  │  └─ Notifications.tsx
│  │  │     │  │  │  └─ NotificationsTypes
│  │  │     │  │  │     ├─ NotificationsTypes.styles.ts
│  │  │     │  │  │     └─ NotificationsTypes.tsx
│  │  │     │  │  ├─ payments
│  │  │     │  │  │  ├─ paymentHistory
│  │  │     │  │  │  │  ├─ Payment
│  │  │     │  │  │  │  │  ├─ Payment.styles.ts
│  │  │     │  │  │  │  │  └─ Payment.tsx
│  │  │     │  │  │  │  ├─ PaymentHistory
│  │  │     │  │  │  │  │  ├─ PaymentHistory.styles.ts
│  │  │     │  │  │  │  │  └─ PaymentHistory.tsx
│  │  │     │  │  │  │  ├─ PaymentsTable
│  │  │     │  │  │  │  │  ├─ PaymentsTable.styles.ts
│  │  │     │  │  │  │  │  └─ PaymentsTable.tsx
│  │  │     │  │  │  │  └─ Status
│  │  │     │  │  │  │     ├─ Status.styles.ts
│  │  │     │  │  │  │     └─ Status.tsx
│  │  │     │  │  │  ├─ paymentMethod
│  │  │     │  │  │  │  ├─ ActionButtons
│  │  │     │  │  │  │  │  ├─ ActionButtons.styles.ts
│  │  │     │  │  │  │  │  └─ ActionButtons.tsx
│  │  │     │  │  │  │  ├─ addNewCard
│  │  │     │  │  │  │  │  ├─ AddNewCardButton
│  │  │     │  │  │  │  │  │  ├─ AddNewCardButton.styles.ts
│  │  │     │  │  │  │  │  │  └─ AddNewCardButton.tsx
│  │  │     │  │  │  │  │  └─ AddNewCardModal.tsx
│  │  │     │  │  │  │  ├─ PaymentCard
│  │  │     │  │  │  │  │  ├─ PaymentCard.styles.ts
│  │  │     │  │  │  │  │  └─ PaymentCard.tsx
│  │  │     │  │  │  │  ├─ PaymentCardsWidget.tsx
│  │  │     │  │  │  │  ├─ paymentForm
│  │  │     │  │  │  │  │  ├─ CardholderItem
│  │  │     │  │  │  │  │  │  └─ CardholderItem.tsx
│  │  │     │  │  │  │  │  ├─ CardNumberItem
│  │  │     │  │  │  │  │  │  └─ CardNumberItem.tsx
│  │  │     │  │  │  │  │  ├─ CardThemeItem
│  │  │     │  │  │  │  │  │  ├─ CardThemeItem.styles.ts
│  │  │     │  │  │  │  │  │  └─ CardThemeItem.tsx
│  │  │     │  │  │  │  │  ├─ CVVItem
│  │  │     │  │  │  │  │  │  └─ CVVItem.tsx
│  │  │     │  │  │  │  │  ├─ ExpDateItem
│  │  │     │  │  │  │  │  │  └─ ExpDateItem.tsx
│  │  │     │  │  │  │  │  ├─ interfaces.ts
│  │  │     │  │  │  │  │  └─ PaymentForm
│  │  │     │  │  │  │  │     ├─ PaymentForm.styles.ts
│  │  │     │  │  │  │  │     └─ PaymentForm.tsx
│  │  │     │  │  │  │  └─ PaymentMethod.tsx
│  │  │     │  │  │  └─ Payments.tsx
│  │  │     │  │  ├─ PersonalInfo
│  │  │     │  │  │  ├─ AddressItem
│  │  │     │  │  │  │  └─ AddressItem.tsx
│  │  │     │  │  │  ├─ BirthdayItem
│  │  │     │  │  │  │  ├─ BirthdayItem.styles.ts
│  │  │     │  │  │  │  └─ BirthdayItem.tsx
│  │  │     │  │  │  ├─ CitiesItem
│  │  │     │  │  │  │  └─ CitiesItem.tsx
│  │  │     │  │  │  ├─ CountriesItem
│  │  │     │  │  │  │  ├─ CountriesItem.styles.ts
│  │  │     │  │  │  │  └─ CountriesItem.tsx
│  │  │     │  │  │  ├─ EmailItem
│  │  │     │  │  │  │  └─ EmailItem.tsx
│  │  │     │  │  │  ├─ FirstNameItem
│  │  │     │  │  │  │  └─ FirstNameItem.tsx
│  │  │     │  │  │  ├─ LanguageItem
│  │  │     │  │  │  │  └─ LanguageItem.tsx
│  │  │     │  │  │  ├─ LastNameItem
│  │  │     │  │  │  │  └─ LastNameItem.tsx
│  │  │     │  │  │  ├─ NicknameItem
│  │  │     │  │  │  │  └─ NicknameItem.tsx
│  │  │     │  │  │  ├─ PersonalInfo.tsx
│  │  │     │  │  │  ├─ PhoneItem
│  │  │     │  │  │  │  ├─ PhoneItem.styles.ts
│  │  │     │  │  │  │  └─ PhoneItem.tsx
│  │  │     │  │  │  ├─ SexItem
│  │  │     │  │  │  │  └─ SexItem.tsx
│  │  │     │  │  │  ├─ SocialLinksItem
│  │  │     │  │  │  │  └─ SocialLinksItem.tsx
│  │  │     │  │  │  ├─ WebsiteItem
│  │  │     │  │  │  │  └─ WebsiteItem.tsx
│  │  │     │  │  │  └─ ZipcodeItem
│  │  │     │  │  │     └─ ZipcodeItem.tsx
│  │  │     │  │  └─ SecuritySettings
│  │  │     │  │     ├─ passwordForm
│  │  │     │  │     │  ├─ ConfirmPasswordItem
│  │  │     │  │     │  │  └─ ConfirmPasswordItem.tsx
│  │  │     │  │     │  ├─ CurrentPasswordItem
│  │  │     │  │     │  │  └─ CurrentPasswordItem.tsx
│  │  │     │  │     │  ├─ NewPasswordItem
│  │  │     │  │     │  │  └─ NewPasswordItem.tsx
│  │  │     │  │     │  └─ PasswordForm
│  │  │     │  │     │     ├─ PasswordForm.styles.ts
│  │  │     │  │     │     └─ PasswordForm.tsx
│  │  │     │  │     ├─ SecuritySettings.tsx
│  │  │     │  │     └─ twoFactorAuth
│  │  │     │  │        ├─ TwoFactorAuth.styles.ts
│  │  │     │  │        ├─ TwoFactorAuth.tsx
│  │  │     │  │        ├─ TwoFactorOptions
│  │  │     │  │        │  ├─ TwoFactorOptions.styles.ts
│  │  │     │  │        │  └─ TwoFactorOptions.tsx
│  │  │     │  │        └─ TwoFactorSwitch
│  │  │     │  │           └─ TwoFactorSwitch.tsx
│  │  │     │  └─ ProfileFormNav.tsx
│  │  │     ├─ ProfileInfo
│  │  │     │  ├─ ProfileInfo.styles.ts
│  │  │     │  └─ ProfileInfo.tsx
│  │  │     └─ ProfileNav
│  │  │        ├─ ProfileNav.styles.ts
│  │  │        └─ ProfileNav.tsx
│  │  └─ tables
│  │     ├─ BasicTable
│  │     │  └─ BasicTable.tsx
│  │     ├─ editableTable
│  │     │  ├─ EditableCell.tsx
│  │     │  └─ EditableTable.tsx
│  │     ├─ Tables
│  │     │  ├─ Tables.styles.ts
│  │     │  └─ Tables.tsx
│  │     └─ TreeTable
│  │        └─ TreeTable.tsx
│  ├─ config
│  │  └─ config.ts
│  ├─ constants
│  │  ├─ bloodTestResults.ts
│  │  ├─ cards.ts
│  │  ├─ cardThemes.ts
│  │  ├─ categoriesList.ts
│  │  ├─ config
│  │  │  ├─ activityStatuses.tsx
│  │  │  ├─ components.ts
│  │  │  └─ statistics.ts
│  │  ├─ dashboardNews.ts
│  │  ├─ Dates.ts
│  │  ├─ defaultPaddings.ts
│  │  ├─ enums
│  │  │  └─ priorities.ts
│  │  ├─ healthChartData.ts
│  │  ├─ kanbanData.ts
│  │  ├─ kanbanPeople.ts
│  │  ├─ kanbanTags.ts
│  │  ├─ languages.ts
│  │  ├─ maxNews.ts
│  │  ├─ modalSizes.ts
│  │  ├─ newsTags.ts
│  │  ├─ notificationsSeverities.ts
│  │  ├─ patientResultsData.tsx
│  │  ├─ patientResultStatus.ts
│  │  ├─ patterns.ts
│  │  ├─ paymentStatuses.ts
│  │  ├─ polyclinicsData.ts
│  │  ├─ profileNavData.tsx
│  │  └─ specifities.ts
│  ├─ controllers
│  │  └─ notificationController.tsx
│  ├─ domain
│  │  └─ UserModel.ts
│  ├─ hocs
│  │  └─ withLoading.hoc.tsx
│  ├─ hooks
│  │  ├─ reduxHooks.ts
│  │  ├─ useAutoNightMode.ts
│  │  ├─ useDebounce.ts
│  │  ├─ useDimensions.ts
│  │  ├─ useLanguage.ts
│  │  ├─ useMounted.ts
│  │  ├─ useOnClickOutside.ts
│  │  ├─ usePWA.ts
│  │  ├─ useResponsive.ts
│  │  └─ useThemeWatcher.ts
│  ├─ i18n.ts
│  ├─ index.tsx
│  ├─ interfaces
│  │  └─ interfaces.ts
│  ├─ locales
│  │  ├─ de
│  │  │  └─ translation.json
│  │  └─ en
│  │     └─ translation.json
│  ├─ pages
│  │  ├─ AdvancedFormsPage.tsx
│  │  ├─ ChartsPage.tsx
│  │  ├─ DashboardPages
│  │  │  ├─ DashboardPage.styles.ts
│  │  │  ├─ MedicalDashboardPage.tsx
│  │  │  └─ NftDashboardPage.tsx
│  │  ├─ DataTablesPage.tsx
│  │  ├─ Error404Page.tsx
│  │  ├─ ForgotPasswordPage.tsx
│  │  ├─ KanbanPage.tsx
│  │  ├─ LockPage.tsx
│  │  ├─ LoginPage.tsx
│  │  ├─ maps
│  │  │  ├─ GoogleMapsPage
│  │  │  │  └─ GoogleMapsPage.tsx
│  │  │  ├─ LeafletMapsPage
│  │  │  │  └─ LeafletMapsPage.tsx
│  │  │  ├─ maps.styles.ts
│  │  │  ├─ PigeonsMapsPage
│  │  │  │  └─ PigeonsMapsPage.tsx
│  │  │  └─ ReactSimpleMapsPage
│  │  │     └─ ReactSimpleMapsPage.tsx
│  │  ├─ NewPasswordPage.tsx
│  │  ├─ NewsFeedPage.tsx
│  │  ├─ NotificationsPage.tsx
│  │  ├─ PaymentsPage.tsx
│  │  ├─ PersonalInfoPage.tsx
│  │  ├─ SecurityCodePage.tsx
│  │  ├─ SecuritySettingsPage.tsx
│  │  ├─ ServerErrorPage.tsx
│  │  ├─ SignUpPage.tsx
│  │  └─ uiComponentsPages
│  │     ├─ ButtonsPage.tsx
│  │     ├─ dataDisplay
│  │     │  ├─ AvatarsPage.tsx
│  │     │  ├─ BadgesPage.tsx
│  │     │  ├─ CollapsePage.tsx
│  │     │  └─ PaginationPage.tsx
│  │     ├─ DropdownsPage.tsx
│  │     ├─ feedback
│  │     │  ├─ AlertsPage.tsx
│  │     │  ├─ NotificationsPage.tsx
│  │     │  ├─ ProgressPage.tsx
│  │     │  ├─ ResultsPage.tsx
│  │     │  └─ SkeletonsPage.tsx
│  │     ├─ forms
│  │     │  ├─ AutoCompletesPage.tsx
│  │     │  ├─ CheckboxesPage.tsx
│  │     │  ├─ DateTimePickersPage.tsx
│  │     │  ├─ InputsPage.tsx
│  │     │  ├─ RadiosPage.tsx
│  │     │  ├─ RatesPage.tsx
│  │     │  ├─ SelectsPage.tsx
│  │     │  ├─ StepsPage.tsx
│  │     │  ├─ SwitchesPage.tsx
│  │     │  └─ UploadsPage.tsx
│  │     ├─ modals
│  │     │  ├─ ModalsPage.tsx
│  │     │  ├─ PopconfirmsPage.tsx
│  │     │  └─ PopoversPage.tsx
│  │     ├─ navigation
│  │     │  ├─ BreadcrumbsPage.tsx
│  │     │  └─ TabsPage.tsx
│  │     ├─ SpinnersPage.tsx
│  │     └─ UIComponentsPage.styles.ts
│  ├─ react-app-env.d.ts
│  ├─ reportWebVitals.ts
│  ├─ service-worker.ts
│  ├─ services
│  │  └─ localStorage.service.ts
│  ├─ serviceWorkerRegistration.ts
│  ├─ store
│  │  ├─ middlewares
│  │  │  └─ errorLogging.middleware.ts
│  │  ├─ slices
│  │  │  ├─ authSlice.ts
│  │  │  ├─ index.ts
│  │  │  ├─ nightModeSlice.ts
│  │  │  ├─ pwaSlice.ts
│  │  │  ├─ themeSlice.ts
│  │  │  └─ userSlice.ts
│  │  └─ store.ts
│  ├─ styles
│  │  ├─ GlobalStyle.ts
│  │  ├─ resetCss.ts
│  │  ├─ themes
│  │  │  ├─ constants.ts
│  │  │  ├─ dark
│  │  │  │  └─ darkTheme.ts
│  │  │  ├─ light
│  │  │  │  └─ lightTheme.ts
│  │  │  ├─ main.less
│  │  │  ├─ themeVariables.ts
│  │  │  └─ types.ts
│  │  └─ _override_variables.less
│  ├─ types
│  │  └─ generalTypes.ts
│  └─ utils
│     └─ utils.tsx
├─ tsconfig.json
├─ tsconfig.paths.json
└─ yarn.lock

```
