import React, { useState } from 'react'
import { UserSession } from 'blockstack';
import ImageUploader from 'react-images-upload';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputAdornment from '@material-ui/core/InputAdornment'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { Category } from './models/Category';
import { State } from './models/State';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

export default function CreateProduct(props: { userSession: UserSession }) {
  const classes = useStyles();
  const [photos, setPhotos] = useState<Array<File>>([])
  const [price, setPrice] = useState('0')
  const [category, setCategory] = useState<Category>(Category.servicos)
  const [description, setDescription] = useState('')
  const [UF, setUF] = useState(State.digital)

  const onDrop = (newPhotos: Array<File>) => {
    setPhotos([...photos, ...newPhotos]);
  }

  const onPriceChange = (e: React.ChangeEvent<{ value: string }>) => {
    setPrice(e.target.value)
  }

  const onDescriptionChange = (e: React.ChangeEvent<{ value: string }>) => {
    setDescription(e.target.value)
  }

  const onCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setCategory(e.target.value as Category)
  }

  const onUFChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setUF(e.target.value as State)
  }

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      <form noValidate autoComplete="off" className={classes.root}>
        <legend>Cadastrar Produto</legend>
        <TextField
          required
          label="Nome do Produto"
          fullWidth={true}
          variant="outlined"
        />
        <TextField
          label="Descrição"
          multiline
          rowsMax="15"
          value={description}
          onChange={onDescriptionChange}
          variant="outlined"
          fullWidth={true}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel>Preço</InputLabel>
          <OutlinedInput
            required
            value={price}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            labelWidth={60}
            onChange={onPriceChange}
          />
        </FormControl>
        <ImageUploader
          withIcon={true}
          buttonText='Envie fotos do produto'
          onChange={onDrop}
          imgExtension={['.jpg', '.gif', '.png', '.gif']}
          maxFileSize={5242880}
          withPreview={true}
          label={'Tamanho máximo dos arquivos: 5mb. Imagens permitidas: .jpg, .gif, .png'}
        />
        <FormControl required
          fullWidth={true}>
          <InputLabel>Categoria</InputLabel>
          <Select value={category} onChange={onCategoryChange}>
            {Object.entries(Category).map(([key, value]) => (
              <MenuItem key={key} value={value}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl required
          fullWidth={true}>
          <InputLabel>Localidade do Produto</InputLabel>
          <Select value={UF} onChange={onUFChange}>
            {Object.entries(State).map(([key, value]) => (
              <MenuItem key={key} value={value}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>

      </form>

    </Grid>
  )
}
