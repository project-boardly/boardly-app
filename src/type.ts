type ProductType = {
  id:                   string;
  object:               string;
  attributes:           any[];
  default_price:        string;
  description:          null;
  features:             any[];
  images:               string[];
  name:                 string;
  type:                 string;
  unit_label:           null;
  url:                  null;
  price: Price
};

type Price = {
  id:                  string;
  object:              string;
  active:              boolean;
  billing_scheme:      string;
  created:             number;
  currency:            string;
  custom_unit_amount:  null;
  livemode:            boolean;
  lookup_key:          null;
  nickname:            null;
  product:             string;
  recurring:           null;
  tax_behavior:        string;
  tiers_mode:          null;
  transform_quantity:  null;
  type:                string;
  unit_amount:         number;
  unit_amount_decimal: string;
}