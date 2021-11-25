let pkgs = import <nixpkgs> {};

in pkgs.mkShell rec {
  name = "neovimcraft";

  buildInputs = with pkgs; [
    nodejs yarn google-cloud-sdk
  ];
}
