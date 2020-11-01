import './VIcon.sass'

// Utilities
import { computed, defineComponent, h } from 'vue'
import { useIcons, makeSizeProps, useSizeClasses } from '@/composables'
import makeProps from '@/util/makeProps'

// Types
import type { InternalIcon } from '@/composables'

const VSvgIcon = defineComponent({
  name: 'VSvgIcon',
  props: {
    path: String,
  },
  setup (props) {
    return () => h('svg', {
      class: 'v-icon__svg',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      role: 'img',
      'aria-hidden': true,
    }, [h('path', { d: props.path })])
  },
})

const genContent = (icon: InternalIcon, props: Record<string, unknown>) => {
  if (icon.component) return h(icon.component as any, { class: 'v-icon__component', ...icon.props })
  else if (icon.isSvg) return h(VSvgIcon, { path: icon.name })
  else if (icon.isMaterialIcon) return icon.name

  return undefined
}

export default defineComponent({
  name: 'VIcon',
  props: makeProps({
    dense: Boolean,
    disabled: Boolean,
    left: Boolean,
    right: Boolean,
    tag: {
      type: String,
      required: false,
      default: 'i',
    },
    icon: {
      type: String,
      required: true,
    },
    ...makeSizeProps(),
  }),
  setup (props, context) {
    const { sizeClasses } = useSizeClasses(props)
    const icons = useIcons()
    // const name = context.slots.default?.()[0].children as string // This produces warning in 3.0
    const icon = computed(() => icons.get(props.icon))
    const hasClickListener = computed(() => !!context.attrs.onClick)
    const tag = computed(() => hasClickListener.value ? 'button' : props.tag)

    return () => h(tag.value, {
      class: [
        'v-icon',
        'notranslate',
        {
          'v-icon--disabled': props.disabled,
          'v-icon--left': props.left,
          'v-icon--right': props.right,
          'v-icon--link': hasClickListener.value,
          'v-icon--dense': props.dense,
        },
        sizeClasses.value,
        !icon.value.component && {
          'material-icons': icon.value.isMaterialIcon,
          [icon.value.name]: !icon.value.isMaterialIcon, // Material Icons uses ligatures, not classes
          [icon.value.type]: !icon.value.isMaterialIcon && !icon.value.isFontAwesome5, // and Font Awesome 5 icon names already include type
        },
        // color here
      ],
      'aria-hidden': !hasClickListener.value,
      disabled: hasClickListener.value && props.disabled,
      type: hasClickListener.value ? 'button' : undefined,
      ...context.attrs,
    }, genContent(icon.value, props))
  },
})
