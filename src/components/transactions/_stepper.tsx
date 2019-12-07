import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { BuyerStatus, SellerStatus } from '../../models/Transaction';
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles,
} from '@material-ui/core/styles';
import {
  Step,
  StepConnector,
  StepLabel,
  Stepper,
} from '@material-ui/core'
import { StepIconProps } from '@material-ui/core/StepIcon';
import {
  LocalShippingRounded,
  MonetizationOnRounded,
  CheckCircleRounded,
} from '@material-ui/icons';

const ColorlibConnector = withStyles({
  alternativeLabel: {
    top: 22,
  },
  active: {
    '& $line': {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  completed: {
    '& $line': {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
})(StepConnector);

const useColorlibStepIconStyles = makeStyles({
  root: {
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  },
  completed: {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
  },
});

function ColorlibStepIcon(props: StepIconProps) {
  const classes = useColorlibStepIconStyles();
  const { active, completed } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <MonetizationOnRounded />,
    2: <LocalShippingRounded />,
    3: <CheckCircleRounded />,
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  }),
);

interface TransactionStepperProps {
  buyerStatus: BuyerStatus;
  sellerStatus: SellerStatus;
}

export default function TransactionStepper(props: TransactionStepperProps) {
  const classes = useStyles()
  const { buyerStatus, sellerStatus } = props

  const [activeStep, setActiveStep] = useState(1) // do not change that
  const [actives, setActives] = useState([false, false, false])
  const [steps, setSteps] = useState(['', '', ''])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const s = ['', '', '']
    const a = [false, false, false]

    switch (sellerStatus) {
      case SellerStatus.delivered:
        s[1] = 'Enviado'
        a[1] = true
        break
      case SellerStatus.waiting:
        s[1] = 'Aguardando envio'
        break
    }

    switch (buyerStatus) {
      case BuyerStatus.received:
        s[2] = 'Recebido'
        s[0] = 'Pago'
        a[2] = true
        a[0] = true
        setActiveStep(2)
        break
      case BuyerStatus.paid:
        s[0] = 'Pago'
        setActiveStep(0)
        a[0] = true
        break
      case BuyerStatus.notPaid:
        s[0] = 'Aguardando pagamento'
        setActiveStep(0)
        break
    }

    setSteps(s)
    setActives(a)
    setIsReady(true)
  }, [])

  return (
    <div className={classes.root}>
      {isReady &&
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {steps.map((label, idx) => (
            <Step key={idx}>
              <StepLabel
                active={actives[idx]}
                completed={actives[idx]}
                StepIconComponent={ColorlibStepIcon}>{label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      }
    </div>
  );
}
