const isCypress = typeof (window as any).Cypress !== 'undefined';

export default ({ store }: any) => {
  if (isCypress) {
    (window as any).store = store;
  }
};
