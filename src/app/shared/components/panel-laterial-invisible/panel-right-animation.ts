import { animate, animation, state, style, transition, trigger } from "@angular/animations";

export const transitionRightToLeftAnimation = animation([
    trigger('slideInOut', [
        state('in', style({
          transform: 'translate3d(0,0,0)'
        })),
        state('out', style({
          transform: 'translate3d(100%, 0, 0)'
        })),
        transition('in => out', animate('400ms ease-in-out')),
        transition('out => in', animate('400ms ease-in-out'))
      ]),
]);

export const transitionLeftToRigthAnimation = animation([
    trigger('slideInOut', [
        state('in', style({
          transform: 'translate3d(0,0,0)'
        })),
        state('out', style({
          transform: 'translate3d(0, 100%, 0)'
        })),
        transition('in => out', animate('400ms ease-in-out')),
        transition('out => in', animate('400ms ease-in-out'))
      ]),
]);