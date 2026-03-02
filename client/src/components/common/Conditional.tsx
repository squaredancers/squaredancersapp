const Conditional = (props: { condition: boolean; children: any }) => {
  if (props.condition) {
    return props.children;
  } else {
    return null;
  }
};

export default Conditional;
